import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '@repo/db/entities/blog/post';
import { Repository } from 'typeorm';

@Injectable()
export class BlogService {
  constructor(
   @InjectRepository(Post)
   private readonly postRepository: Repository<Post>,

  ) {}
  async getBlogContentBySlug(slug: string): Promise<Partial<Post>> {
    const post = await this.postRepository.findOne({
      where: { slug },
    });

    if (!post) throw new NotFoundException('Post not found');
    
    return post;
  }
}
