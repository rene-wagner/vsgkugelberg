import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { PrismaModule } from 'nestjs-prisma';
import { PasswordService } from './common/services/password.service';

@Module({
  imports: [PrismaModule.forRoot({ isGlobal: true })],
  controllers: [AppController, HealthController],
  providers: [AppService, PasswordService],
})
export class AppModule {}
