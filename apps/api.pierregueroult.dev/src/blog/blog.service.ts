import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { createHash } from 'crypto';
import * as fs from 'fs/promises';
import matter from 'gray-matter';
import { decompressFromBase64 } from 'lz-string';
import { dirname, resolve } from 'path';
import { Repository } from 'typeorm';

import { User } from '@repo/db/entities/auth/user';
import { Category } from '@repo/db/entities/blog/category';
import { Post } from '@repo/db/entities/blog/post';
import { Tag } from '@repo/db/entities/blog/tag';
import { PostVisibility } from '@repo/db/enum/blog/status';
import type {
  BlogResponse,
  ContentFrontMatter,
  ExcalidrawJson,
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

  async getBlogContentBySlug(slug: string, user: User | null): Promise<BlogResponse> {
    const databaseData = await this.postRepository.findOne({
      where: { slug },
      relations: ['comments', 'categories', 'tags'],
    });

    const markdownData = await this.readMarkdownFile(slug);

    if (databaseData?.visibility === PostVisibility.PRIVATE && !user) {
      throw new ForbiddenException('You must be logged in to access this content.');
    }

    if (!markdownData) {
      throw new NotFoundException(`Markdown file for slug "${slug}" not found.`);
    }

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

    if (content.visibility === PostVisibility.PRIVATE && !user) {
      throw new ForbiddenException('You must be logged in to access this content.');
    }

    if (markdownData.frontMatter.tags?.includes('excalidraw')) {
      try {
        const compressedJsonDrawing = markdownData.content
          .split('```compressed-json')[1]
          .split('```')[0];

        const result = this.decompressDrawing(compressedJsonDrawing);

        return {
          slug: content.slug,
          frontMatter: markdownData.frontMatter,
          drawing: result,
          database: {
            id: content._id,
            ...content,
          },
        };
      } catch (error) {
        throw new Error(`Error parsing excalidraw drawing in markdown: ${error}`);
      }
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

    if (markdownData.frontMatter.categories && markdownData.frontMatter.categories.length > 0) {
      const categories: Category[] = [];
      for (const categoryName of markdownData.frontMatter.categories) {
        let category = await this.postRepository.manager.findOne(Category, {
          where: { name: categoryName },
        });
        if (!category) {
          category = new Category();
          category.name = categoryName;
          await this.postRepository.manager.save(category);
        }
        categories.push(category);
      }
      post.categories = categories;
    } else {
      post.categories = [];
    }

    if (markdownData.frontMatter.tags && markdownData.frontMatter.tags.length > 0) {
      const tags: Tag[] = [];
      for (const tagName of markdownData.frontMatter.tags) {
        let tag = await this.postRepository.manager.findOne(Tag, {
          where: { name: tagName },
        });
        if (!tag) {
          tag = new Tag();
          tag.name = tagName;
          await this.postRepository.manager.save(tag);
        }
        tags.push(tag);
      }
      post.tags = tags;
    } else {
      post.tags = [];
    }

    await this.postRepository.save(post);
  }

  private resolveMarkdownFileDirectory(): string {
    const packageJsonPath = require.resolve('@repo/content/package.json');
    const contentPackageDir = dirname(packageJsonPath);
    return resolve(contentPackageDir, 'blog');
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
    if (!resultAsString) throw new Error('The drawing data is corrupted or invalid.');

    try {
      const result = JSON.parse(resultAsString);
      return result;
    } catch {
      throw new Error('The drawing data is corrupted or invalid.');
    }
  }
}
