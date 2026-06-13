import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

type RateLimitEntry = {
  count: number;
  firstRequestAt: number;
};

@Injectable()
export class RateLimiterService {
  private readonly entries = new Map<string, RateLimitEntry>();

  consume(key: string, limit: number, windowMs: number) {
    const now = Date.now();
    const entry = this.entries.get(key);

    if (!entry || now - entry.firstRequestAt > windowMs) {
      this.entries.set(key, { count: 1, firstRequestAt: now });
      return;
    }

    if (entry.count >= limit) {
      entry.count += 1;
      this.entries.set(key, entry);
      throw new HttpException(
        'Too many requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    this.entries.set(key, {
      count: entry.count + 1,
      firstRequestAt: entry.firstRequestAt,
    });
  }

  reset(key: string) {
    this.entries.delete(key);
  }
}
