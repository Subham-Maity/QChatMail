import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma';
import { ConfigModule } from '@nestjs/config';
import { validateConfig } from './validate/env.validation';
import { LoggerMiddleware } from './logger';

// // For request only
// LoggerMiddleware.configure({
//   logRequest: true,
// });

// // For request and response
// LoggerMiddleware.configure({
//   logRequest: true,
//   logResponse: true
// });

// For everything
LoggerMiddleware.configure({
  logRequest: true,
  logHeaders: true,
  logBody: true,
  logResponse: true,
  logLatency: true,
  logUserAgent: true,
  logIP: true,
  logProtocol: true,
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: validateConfig,
    }),
    AuthModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
