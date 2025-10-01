import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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

const STRING_TO_VISIBILITY: Record<string, PostVisibility> = {
  public: PostVisibility.PUBLIC,
  private: PostVisibility.PRIVATE,
  unlisted: PostVisibility.UNLISTED,
};

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    private readonly embeddingService: EmbeddingService,
  ) {}

  async getBlogContentBySlug(slug: string, user: User | null): Promise<BlogResponse> {
    const databaseData = await this.postRepository.findOne({
      where: { slug },
      select: ['_id', 'fileHash'],
    });

    const markdownData = await this.readMarkdownFile(slug);

    if (!databaseData || this.needsSync(databaseData, markdownData)) {
      await this.syncContentToDatabase(slug, markdownData, databaseData);
    }

    this.validateAccessPermissions(databaseData, user);

    if (!markdownData) {
      throw new NotFoundException(`Markdown file for slug "${slug}" not found.`);
    }

    const content = await this.postRepository.findOne({
      where: { slug },
      relations: ['tags'],
    });

    if (!content) {
      throw new NotFoundException(`Blog post with slug "${slug}" not found.`);
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
    slug: string,
    markdownData: MarkdownContent,
    existingData?: Post,
  ): Promise<void> {
    const post = existingData || new Post();

    post.slug = slug;
    post.title = markdownData.frontMatter.title || slug;
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
}
