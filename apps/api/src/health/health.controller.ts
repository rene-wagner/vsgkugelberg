import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators';

interface HealthResponse {
  status: string;
}

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check(): HealthResponse {
    return { status: 'ok' };
  }
}
