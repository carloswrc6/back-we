import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { I18nService } from '../services/i18n.service';

export const GetLanguage = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const language = request.headers['accept-language']?.split(',')[0].toLowerCase() || 'en';

    const i18nService = new I18nService();
    
    // Normalize language code (e.g., 'es-ES' -> 'es')
    const normalizedLanguage = language.split('-')[0];
    
    return i18nService.isLanguageSupported(normalizedLanguage)
      ? normalizedLanguage
      : 'en';
  },
);
