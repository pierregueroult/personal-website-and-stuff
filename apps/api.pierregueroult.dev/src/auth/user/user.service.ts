import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { AuthorizedEmail } from '@repo/db/entities/authorized-email';
import { User } from '@repo/db/entities/user';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AuthorizedEmail)
    private readonly authorizedEmailRepository: Repository<AuthorizedEmail>,
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

  async isEmailAuthorized(email: string): Promise<boolean> {
    try {
      const authorized = await this.authorizedEmailRepository.findOne({
        where: { email },
      });

      return authorized !== null;
    } catch {

      return false;
    }
  }

  async createAuthorizedEmail(email: string): Promise<AuthorizedEmail> {
    const authorizedEmail = this.authorizedEmailRepository.create({ email });
    return await this.authorizedEmailRepository.save(authorizedEmail);
  }
}
