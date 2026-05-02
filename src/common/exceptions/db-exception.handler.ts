import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

export const handleDBExceptions = (error: any, logger: Logger) => {
  if (error.code === '23505') {
    throw new BadRequestException({
      field: 'email',
      message: 'El email ya está registrado',
    });
  }

  if (error.response?.message) {
    throw new BadRequestException({
      message: error.response.message,
    });
  }
  
  logger.error(error);

  throw new InternalServerErrorException('Unexpected error, check server logs');
};
