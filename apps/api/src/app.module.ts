import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { PrismaModule } from 'nestjs-prisma';
import { PasswordService } from './common/services/password.service';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';

@Module({
  imports: [
    PrismaModule.forRoot({ isGlobal: true }),
    UsersModule,
    PostsModule,
    CategoriesModule,
    TagsModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService, PasswordService],
})
export class AppModule {}
