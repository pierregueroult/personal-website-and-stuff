import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { createHash } from 'crypto';
import * as fs from 'fs/promises';
import matter from 'gray-matter';
import { createRequire } from 'module';
import { dirname, resolve } from 'path';
import { Repository } from 'typeorm';

import { Post } from '@repo/db/entities/blog/post';
import { PostVisibility } from '@repo/db/enum/blog/status';
import type {
  ContentFrontMatter,
  ContentResponse,
  ContentVisibility,
  MarkdownContent,
} from '@repo/db/types/blog/blog.interface';

const STRING_TO_VISIBILITY: Record<string, PostVisibility> = {
  public: PostVisibility.PUBLIC,
  private: PostVisibility.PRIVATE,
  unlisted: PostVisibility.UNLISTED,
};

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async getBlogContentBySlug(
    slug: string,
    requestedVisibility: ContentVisibility,
  ): Promise<ContentResponse> {
    const databaseData = await this.postRepository.findOne({
      where: { slug },
      relations: ['comments', 'categories', 'tags'],
    });

    const markdownData = await this.readMarkdownFile(slug);

    if (!databaseData || this.needsSync(databaseData, markdownData)) {
      await this.syncContentToDatabase(slug, markdownData, databaseData);
    }

    const content = await this.postRepository.findOne({
      where: { slug },
      relations: ['comments', 'categories', 'tags'],
    });

    if (!content) {
      throw new NotFoundException(`Blog post with slug "${slug}" not found.`);
    }

    if (content.visibility !== requestedVisibility) {
      throw new ForbiddenException(`You do not have access to this blog post.`);
    }

    return {
      slug: content.slug,
      frontMatter: markdownData.frontMatter,
      content: markdownData.content,
      database: {
        id: content._id,
        ...content,
      },
    };
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

  private needsSync(databaseData: Post, markdownData: MarkdownContent): boolean {
    if (!databaseData) return true;
    return databaseData.fileHash !== markdownData.fileHash;
  }

  private async syncContentToDatabase(
    slug: string,
    markdownData: MarkdownContent,
    existingData?: Post,
  ) {
    const post = existingData || new Post();

    post.slug = slug;
    post.title = markdownData.frontMatter.title || 'slug';
    post.visibility =
      STRING_TO_VISIBILITY[markdownData.frontMatter.visibility] || PostVisibility.PRIVATE;
    post.fileHash = markdownData.fileHash;

    // TODO LATER : handle categories and tags (read from markdown front matter and sync with db)

    await this.postRepository.save(post);
  }

  private resolveMarkdownFileDirectory(): string {
    const packageJsonPath = require.resolve('@repo/content/package.json');
    const contentPackageDir = dirname(packageJsonPath);

    return resolve(contentPackageDir, 'blog');
  }
}
