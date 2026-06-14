import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { I18nService } from '../services/i18n.service';

@Injectable()
export class I18nMiddleware implements NestMiddleware {
  constructor(private readonly i18nService: I18nService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const language = req.headers['accept-language']?.split(',')[0].toLowerCase() || 'en';
    const normalizedLanguage = language.split('-')[0];

    // Attach language to request
    (req as any).language = this.i18nService.isLanguageSupported(normalizedLanguage)
      ? normalizedLanguage
      : 'en';

    // Attach i18n service to request for easy access
    (req as any).i18n = this.i18nService;

    next();
  }
}
