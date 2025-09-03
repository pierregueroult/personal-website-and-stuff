import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User } from '@repo/db/entities/auth/user';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findUserByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        where: { email },
      });
    } catch {
      return null;
    }
  }

  async createGithubUser(
    email: string,
    name: string,
    githubId: string,
    avatarUrl: string,
  ): Promise<User> {
    const user = this.userRepository.create({
      email,
      name,
      avatar_url: avatarUrl,
      github_id: githubId,
    });

    return await this.userRepository.save(user);
  }
}
