import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthorizedEmail } from '@repo/db/entities/authorized-email';
import { User } from '@repo/db/entities/user';

import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, AuthorizedEmail])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
