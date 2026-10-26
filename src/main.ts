import { NestFactory } from '@nestjs/core';

//Config
import { CorsConfig, Env, VersionConfig } from '@infrastructure/config';

//Root Module
import { AppModule } from './app.module';

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule);

  //Rest
  app.enableCors(CorsConfig);
  app.enableVersioning(VersionConfig);

  await app.listen(Env.PORT);
};

void bootstrap();
