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
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  create(
    @Body(new ValidationPipe({ whitelist: true }))
    createDepartmentDto: CreateDepartmentDto,
  ) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  findAll() {
    return this.departmentsService.findAll();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.departmentsService.findBySlug(slug);
  }

  @Patch(':slug')
  update(
    @Param('slug') slug: string,
    @Body(new ValidationPipe({ whitelist: true }))
    updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(slug, updateDepartmentDto);
  }

  @Delete(':slug')
  remove(@Param('slug') slug: string) {
    return this.departmentsService.remove(slug);
  }
}
