import { NestFactory } from '@nestjs/core';

//Config
import {
  CorsConfig,
  Env,
  SwaggerRoot,
  VersionConfig,
} from '@infrastructure/config';

//Common
import { HttpExceptionFilter } from '@common/filters';

//Root Module
import { AppModule } from './app.module';

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule);

  //Rest
  app.enableCors(CorsConfig);
  app.enableVersioning(VersionConfig);
  app.useGlobalFilters(new HttpExceptionFilter());

  SwaggerRoot(app);

  await app.listen(Env.PORT);
};

void bootstrap();
