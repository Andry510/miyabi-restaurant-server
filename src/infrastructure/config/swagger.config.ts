import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

//Infrastructure
import { SWAGGER_CONFIG } from '@infrastructure/constants';
import { Env } from './env.config';

export const SwaggerConfig = new DocumentBuilder()
  .setTitle(SWAGGER_CONFIG.TITLE)
  .setDescription(SWAGGER_CONFIG.DESCRIPTION)
  .setVersion(SWAGGER_CONFIG.VERSION)
  .addBearerAuth()
  .build();

export const SwaggerRoot = (app: INestApplication): void => {
  if (Env.IS_PRODUCTION) {
    return;
  }

  const document = SwaggerModule.createDocument(app, SwaggerConfig);

  SwaggerModule.setup(SWAGGER_CONFIG.PATH, app, document);
};
