import { ForbiddenException, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { createHash } from 'crypto';
import * as fs from 'fs/promises';
import matter from 'gray-matter';
import { decompressFromBase64 } from 'lz-string';
import { dirname, resolve } from 'path';
import { Repository } from 'typeorm';

import { User } from '@repo/db/entities/auth/user';
import { Post } from '@repo/db/entities/blog/post';
import { PostVisibility } from '@repo/db/enum/blog/status';
import type {
  BlogResponse,
  ContentFrontMatter,
  ExcalidrawJson,
  MarkdownContent,
} from '@repo/db/types/blog/blog.interface';

import { EmbeddingService } from './embedding/embedding.service';
import { slugifyPath } from './utils/slugify.util';

const STRING_TO_VISIBILITY: Record<string, PostVisibility> = {
  public: PostVisibility.PUBLIC,
  private: PostVisibility.PRIVATE,
  unlisted: PostVisibility.UNLISTED,
};

@Injectable()
export class BlogService implements OnModuleInit {
  private readonly logger = new Logger(BlogService.name);

  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    private readonly embeddingService: EmbeddingService,
  ) {}

  async onModuleInit() {
    this.logger.log('Starting blog content discovery and sync...');
    await this.discoverAndSyncAllPosts();
    this.logger.log('Blog content discovery completed');
  }

  async getBlogContentBySlug(slug: string, user: User | null): Promise<BlogResponse> {
    // Clean the slug (it comes from URL already slugified)
    const cleanSlug = slugifyPath(slug);
    
    // Find post by clean slug
    let databaseData = await this.postRepository.findOne({
      where: { slug: cleanSlug },
      select: ['_id', 'fileHash', 'originalFilePath', 'slug'],
    });

    // Determine the file path to read
    // If we have database data with originalFilePath, use it; otherwise try the clean slug
    const filePathToRead = databaseData?.originalFilePath || slug;
    
    const markdownData = await this.readMarkdownFile(filePathToRead);

    // If no database entry or needs sync, create/update it
    if (!databaseData || this.needsSync(databaseData, markdownData)) {
      await this.syncContentToDatabase(cleanSlug, filePathToRead, markdownData, databaseData);
      // Reload database data after sync
      databaseData = await this.postRepository.findOne({
        where: { slug: cleanSlug },
        select: ['_id', 'fileHash', 'originalFilePath', 'slug'],
      });
    }

    this.validateAccessPermissions(databaseData, user);

    if (!markdownData) {
      throw new NotFoundException(`Markdown file for slug "${slug}" not found.`);
    }

    const content = await this.postRepository.findOne({
      where: { slug: cleanSlug },
      relations: ['tags'],
    });

    if (!content) {
      throw new NotFoundException(`Blog post with slug "${slug}" not found.`);
    }

    if (!content._id) {
      throw new Error(`Blog post "${slug}" is missing database ID. This should not happen.`);
    }

    this.validateAccessPermissions(content, user);

    if (markdownData.frontMatter.tags?.includes('excalidraw')) {
      return this.buildExcalidrawResponse(content, markdownData);
    }

    return this.buildStandardResponse(content, markdownData);
  }

  async getAllPosts(): Promise<Post[]> {
    return this.postRepository.find();
  }

  async getPostsList(
    page: number = 1,
    pageSize: number = 10,
    visibility?: PostVisibility,
    tags?: string[],
    user?: User | null,
  ) {
    const skip = (page - 1) * pageSize;

    // Build where clause based on user authentication
    const whereClause: any = {};

    if (!user) {
      // Anonymous users can only see public posts
      whereClause.visibility = PostVisibility.PUBLIC;
    } else if (visibility) {
      // Authenticated users can filter by specific visibility
      whereClause.visibility = visibility;
    }
    // If user is authenticated and no visibility specified, show all

    const [posts, total] = await this.postRepository.findAndCount({
      where: whereClause,
      relations: ['tags'],
      order: { createdAt: 'DESC' },
      skip,
      take: pageSize,
    });

    const postItems = posts.map((post) => ({
      id: post._id.toHexString(),
      title: post.title,
      slug: post.slug,
      visibility: post.visibility,
      tags: post.tags?.map((tag) => tag.slug) || [],
      viewCount: post.viewCount || 0,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      readingTime: post.averageReadingTime || this.estimateReadingTime(post.content),
    }));

    return {
      posts: postItems,
      total,
      page,
      pageSize,
      hasMore: skip + posts.length < total,
    };
  }

  private estimateReadingTime(content: string): number {
    // Average reading speed: 200 words per minute
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  async readMarkdownFile(slug: string): Promise<MarkdownContent> {
    try {
      const baseDir = this.resolveMarkdownFileDirectory();
      const filePath = resolve(baseDir, `${slug}.md`);

      const [fileContent, stats] = await Promise.all([
        fs.readFile(filePath, 'utf-8'),
        fs.stat(filePath),
      ]);

      const { data: frontMatter, content } = matter(fileContent);
      const fileHash = createHash('md5').update(fileContent).digest('hex');

      return {
        frontMatter: frontMatter as ContentFrontMatter,
        content: content,
        fileLastModified: stats.mtime,
        fileHash: fileHash,
      };
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        throw new NotFoundException(`Markdown file for slug "${slug}" not found.`);
      } else {
        throw Error(`Error reading markdown file for slug "${slug}": ${error}`);
      }
    }
  }

  private resolveMarkdownFileDirectory(): string {
    const packageJsonPath = require.resolve('@repo/content/package.json');
    const contentPackageDir = dirname(packageJsonPath);
    return resolve(contentPackageDir, 'blog');
  }

  private needsSync(databaseData: Post, markdownData: MarkdownContent): boolean {
    if (!databaseData) return true;
    return databaseData.fileHash !== markdownData.fileHash;
  }

  private async syncContentToDatabase(
    cleanSlug: string,
    originalFilePath: string,
    markdownData: MarkdownContent,
    existingData?: Post,
  ): Promise<void> {
    const post = existingData || new Post();

    post.slug = cleanSlug;
    post.originalFilePath = originalFilePath;
    post.title = markdownData.frontMatter.title || cleanSlug;
    post.visibility =
      STRING_TO_VISIBILITY[markdownData.frontMatter.visibility] || PostVisibility.PRIVATE;
    post.fileHash = markdownData.fileHash;
    post.content = markdownData.content;
    const embedding = await this.embeddingService.generateEmbedding(markdownData.content);
    post.embedding = embedding;

    await this.postRepository.save(post);
  }

  private decompressDrawing(compressedData: string): ExcalidrawJson {
    let cleanedData = '';
    const length = compressedData.length;
    for (let i = 0; i < length; i++) {
      const char = compressedData[i];
      if (char !== '\n' && char !== '\r') {
        cleanedData += char;
      }
    }

    const resultAsString = decompressFromBase64(cleanedData);
    if (!resultAsString) {
      throw new Error('The drawing data is corrupted or invalid.');
    }

    try {
      const result = JSON.parse(resultAsString);

      return result;
    } catch {
      throw new Error('The drawing data is corrupted or invalid.');
    }
  }

  private buildExcalidrawResponse(content: Post, markdownData: MarkdownContent): BlogResponse {
    try {
      const compressedJsonDrawing = markdownData.content
        .split('```compressed-json')[1]
        .split('```')[0];

      const result = this.decompressDrawing(compressedJsonDrawing);

      return {
        slug: content.slug,
        frontMatter: markdownData.frontMatter,
        drawing: result,
        markdown: markdownData.content,
        database: {
          id: content._id.toHexString(),
          ...content,
        },
      };
    } catch (error) {
      throw new Error(`Error parsing excalidraw drawing in markdown: ${error}`);
    }
  }

  private buildStandardResponse(content: Post, markdownData: MarkdownContent): BlogResponse {
    return {
      slug: content.slug,
      frontMatter: markdownData.frontMatter,
      content: markdownData.content,
      database: {
        id: content._id.toHexString(),
        ...content,
      },
    };
  }

  private validateAccessPermissions(content: Post | null, user: User | null): void {
    if (content?.visibility === PostVisibility.PRIVATE && !user) {
      throw new ForbiddenException('You must be logged in to access this content.');
    }
  }

  /**
   * Discover and sync all markdown files from the content directory
   * This runs on application startup to populate the database
   */
  private async discoverAndSyncAllPosts(): Promise<void> {
    try {
      const baseDir = this.resolveMarkdownFileDirectory();
      const allFiles = await this.walkMarkdownDirectory(baseDir);
      
      this.logger.log(`Found ${allFiles.length} markdown files`);
      
      let synced = 0;
      let skipped = 0;
      
      for (const relativePath of allFiles) {
        try {
          const cleanSlug = slugifyPath(relativePath);
          
          // Check if already in database
          const existingPost = await this.postRepository.findOne({
            where: { slug: cleanSlug },
            select: ['_id', 'fileHash', 'slug'],
          });
          
          // Read markdown file
          const markdownData = await this.readMarkdownFile(relativePath);
          
          // Sync if new or changed
          if (!existingPost || existingPost.fileHash !== markdownData.fileHash) {
            await this.syncContentToDatabase(cleanSlug, relativePath, markdownData, existingPost);
            synced++;
          } else {
            skipped++;
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          this.logger.warn(`Failed to sync "${relativePath}": ${message}`);
        }
      }
      
      this.logger.log(`Sync complete: ${synced} synced, ${skipped} skipped`);
    } catch (error) {
      this.logger.error('Failed to discover and sync posts', error);
    }
  }

  /**
   * Recursively walk directory and find all .md files
   * Returns relative paths from the base blog directory
   */
  private async walkMarkdownDirectory(
    dir: string,
    baseDir?: string,
    relativePath: string = '',
  ): Promise<string[]> {
    const base = baseDir || dir;
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        // Skip hidden files and directories
        if (entry.name.startsWith('.')) continue;
        
        const fullPath = resolve(dir, entry.name);
        const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
        
        if (entry.isDirectory()) {
          // Recursively walk subdirectories
          const subFiles = await this.walkMarkdownDirectory(fullPath, base, relPath);
          files.push(...subFiles);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          // Remove .md extension for the relative path
          const pathWithoutExt = relPath.replace(/\.md$/, '');
          files.push(pathWithoutExt);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Failed to read directory ${dir}: ${message}`);
    }
    
    return files;
  }
}
