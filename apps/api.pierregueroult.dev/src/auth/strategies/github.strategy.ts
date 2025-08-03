import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { type Profile, Strategy } from 'passport-github2';

import { User } from '@repo/db/entities/user';

import { EnvironmentVariables } from '../../env.validation';
import { UserService } from '../user/user.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly userService: UserService,
  ) {
    super({
      clientID: configService.get('NEST_GITHUB_CLIENT_ID'),
      clientSecret: configService.get('NEST_GITHUB_CLIENT_SECRET'),
      callbackURL: configService.get('NEST_GITHUB_CALLBACK_URL'),
      scope: ['user:email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile): Promise<User> {
    const emails = profile.emails;
    const primaryEmail = emails && emails.length > 0 ? emails[0].value : null;

    if (!primaryEmail) {
      throw new Error('No primary email found in GitHub profile');
    }

    const isAuthorized = await this.userService.isEmailAuthorized(primaryEmail);

    if (!isAuthorized) {
      throw new UnauthorizedException('Email not authorized');
    }

    const user = await this.userService.findUserByEmail(primaryEmail);

    if (user) return user;

    return this.userService.createGithubUser(
      primaryEmail,
      profile.displayName,
      profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
      profile.id,
    );
  }
}
