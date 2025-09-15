import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Post } from '@repo/db/entities/blog/post';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async getBlogContentBySlug(slug: string): Promise<Partial<Post> & { content: string }> {
    const post = await this.postRepository.findOne({
      where: { slug },
    });

    if (!post) throw new NotFoundException('Post not found');

    const postContent = await import(`@repo/content/public/${slug}.md`);

    return { ...post, content: postContent.default };
  }

  async getPrivateBlogContentBySlug(slug: string): Promise<Partial<Post> & { content: string }> {
    const post = await this.postRepository.findOne({
      where: { slug },
    });

    if (!post) throw new NotFoundException('Post not found or is not private');

    const postContent = await import(`@repo/content/private/${slug}.md`);

    return { ...post, content: postContent.default };
  }
}
