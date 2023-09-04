import { Controller, Get, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('health')
@Controller()
export class AppController {
  private port = process.env.PORT || 3000;

  constructor(
    private readonly appService: AppService,
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @Get()
  getStatus() {
    return this.appService.getStatus();
  }

  @ApiOperation({ summary: 'Get API status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Everything is okay!' })
  @Get('health')
  @HealthCheck()
  getHealth() {
    return this.health.check([
      () =>
        this.http.pingCheck('basic Check', `http://localhost:${this.port}/`),
    ]);
  }
}
