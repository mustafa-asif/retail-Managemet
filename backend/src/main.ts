import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { OracleExceptionFilter } from './common/filters/oracle-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: false,
  }));

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new OracleExceptionFilter());

  app.enableCors({ origin: process.env.FRONTEND_URL || '*' });

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`Save Mart API running on http://localhost:${port}/api`);
}
bootstrap();
