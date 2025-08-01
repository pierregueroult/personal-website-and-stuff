import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { AuthorizedEmail } from '@repo/db/entities/authorized-email';
import { Token } from '@repo/db/entities/token';
import { User } from '@repo/db/entities/user';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AuthorizedEmail)
    private readonly authorizedEmailRepository: Repository<AuthorizedEmail>,
  ) {}

  async findGithubUser(email: string, githubId: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        where: { email: email, github_id: githubId },
      });
    } catch {
      return null;
    }
  }

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

  async isEmailAuthorized(email: string): Promise<boolean> {
    try {
      const authorizedEmail = await this.authorizedEmailRepository.findOne({
        where: { email },
      });
      return !!authorizedEmail;
    } catch {
      return false;
    }
  }
}
