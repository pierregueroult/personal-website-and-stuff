import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs/promises';
import { Repository } from 'typeorm';

import { Post } from '@repo/db/entities/blog/post';
import { ContentResponse, ContentVisibility } from '@repo/db/types/blog/blog.interface';

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
        relations: ['comments', 'categories', 'tags']
    })

    const markdownData = await this.readMarkdownFile(slug); 
  }

  async readMarkdownFile(slug: string): Promise<string> {
    try {
      const filePath = `../../../packages/content/${slug}.md`;
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const stats = await fs.stat(filePath);

      const { data: frontMatter, content } = matter(fileContent);
    }
}
