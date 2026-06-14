import { Module } from '@nestjs/common';
import { RateLimiterService } from './rate-limiter.service';
import { I18nService } from './services/i18n.service';

@Module({
  providers: [RateLimiterService, I18nService],
  exports: [RateLimiterService, I18nService],
})
export class CommonModule {}
