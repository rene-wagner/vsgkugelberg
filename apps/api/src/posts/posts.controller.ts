import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Body(new ValidationPipe()) createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Get()
  findAll(@Query('published') published?: string) {
    // Convert query string to boolean if present
    const publishedFilter =
      published === 'true' ? true : published === 'false' ? false : undefined;
    return this.postsService.findAll(publishedFilter);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.postsService.findBySlug(slug);
  }

  @Patch(':slug')
  update(
    @Param('slug') slug: string,
    @Body(new ValidationPipe()) updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(slug, updatePostDto);
  }

  @Delete(':slug')
  remove(@Param('slug') slug: string) {
    return this.postsService.remove(slug);
  }
}
