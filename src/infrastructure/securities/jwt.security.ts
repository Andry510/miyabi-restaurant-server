import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

//Domain
import type {
  TJwtPasswordToken,
  TJWtRefreshToken,
  TJwtToken,
} from '@domain/types/config';
import { JwtEntity } from '@domain/value-objects';
import { ResultPattern } from '@domain/patterns/results';

//Infrastructure
import { Env } from '@infrastructure/config';

@Injectable()
export class JwtManager {
  private readonly access_token: JwtService;
  private readonly refresh_token: JwtService;
  private readonly password_token: JwtService;

  constructor() {
    this.access_token = new JwtService({
      secret: Env.JWT_SECRET_TOKEN,
      signOptions: {
        expiresIn: Env.JWT_EXPIRES_TOKEN,
      },
    });

    this.refresh_token = new JwtService({
      secret: Env.JWT_SECRET_REFRESH_TOKEN,
      signOptions: {
        expiresIn: Env.JWT_EXPIRES_REFRESH_TOKEN,
      },
    });

    this.password_token = new JwtService({
      secret: Env.JWT_SECRET_PASSWORD_TOKEN,
      signOptions: {
        expiresIn: Env.JWT_EXPIRES_PASSWORD_TOKEN,
      },
    });
  }

  //Sign
  generateToken = (payload: TJwtToken): Promise<ResultPattern<string>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      JwtManager.name,
      async (): Promise<string> => await this.access_token.signAsync(payload),
    );

  generateRefreshToken = (
    payload: TJWtRefreshToken,
  ): Promise<ResultPattern<string>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      JwtManager.name,
      async (): Promise<string> => await this.refresh_token.signAsync(payload),
    );

  generatePasswordToken = (
    payload: TJwtPasswordToken,
  ): Promise<ResultPattern<string>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      JwtManager.name,
      async (): Promise<string> => await this.password_token.signAsync(payload),
    );

  //Verify
  verifyTokenIgnoringExpiration = (
    token: string,
  ): Promise<ResultPattern<JwtEntity<TJwtToken>>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      JwtManager.name,
      async (): Promise<JwtEntity<TJwtToken>> => {
        const payload = await this.access_token.verifyAsync<TJwtToken>(token, {
          ignoreExpiration: true,
        });
        return new JwtEntity(payload, payload.exp);
      },
    );

  verifyRefreshTokenIgnoringExpiration = (
    token: string,
  ): Promise<ResultPattern<JwtEntity<TJWtRefreshToken>>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      JwtManager.name,
      async (): Promise<JwtEntity<TJWtRefreshToken>> => {
        const payload = await this.refresh_token.verifyAsync<TJWtRefreshToken>(
          token,
          { ignoreExpiration: true },
        );
        return new JwtEntity(payload, payload.exp);
      },
    );

  verifyPasswordTokenIgnoringExpiration = (
    token: string,
  ): Promise<ResultPattern<JwtEntity<TJwtPasswordToken>>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      JwtManager.name,
      async (): Promise<JwtEntity<TJwtPasswordToken>> => {
        const payload =
          await this.password_token.verifyAsync<TJwtPasswordToken>(token, {
            ignoreExpiration: true,
          });
        return new JwtEntity(payload, payload.exp);
      },
    );
}
