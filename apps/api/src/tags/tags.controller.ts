import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Public } from '../auth/decorators';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  create(
    @Body(new ValidationPipe({ whitelist: true })) createTagDto: CreateTagDto,
  ) {
    return this.tagsService.create(createTagDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.tagsService.findAll();
  }

  @Public()
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.tagsService.findBySlug(slug);
  }

  @Patch(':slug')
  update(
    @Param('slug') slug: string,
    @Body(new ValidationPipe({ whitelist: true })) updateTagDto: UpdateTagDto,
  ) {
    return this.tagsService.update(slug, updateTagDto);
  }

  @Delete(':slug')
  remove(@Param('slug') slug: string) {
    return this.tagsService.remove(slug);
  }
}
