import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PasswordService } from '../common/services/password.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PasswordService],
})
export class UsersModule {}
