import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@repo/db/entities/user';
import { AuthorizedEmail } from '@repo/db/entities/authorized-email';

@Module({
  imports: [TypeOrmModule.forFeature([User, AuthorizedEmail])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
