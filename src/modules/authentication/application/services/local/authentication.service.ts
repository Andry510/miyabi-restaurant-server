import { Inject, Injectable } from '@nestjs/common';

//Api
import { API_AUTHENTICATION_MESSAGE } from '../../../api/messages';

//Common
import { API_MESSAGE_GLOBAL } from '@common/messages';

//Domain
import { SESSION_STATUS } from '@domain/enums/shared';
import type { ServiceError } from '@domain/errors';
import { ResultPattern } from '@domain/patterns/results';
import type { TClientInput } from '@domain/types/shared';
import { type UserAccount, UserSession } from '../../../domain/entities';
import type {
  ISessionRepository,
  IUserAccountRepository,
} from '../../../domain/interfaces/repositories';
import type { ILocalAuthenticationService } from '../../../domain/interfaces/services';
import type {
  TAuthenticationComplete,
  TLoginOutput,
  TResetPasswordOutput,
} from '../../../domain/types/entities';
import type {
  TLoginInput,
  TResetPasswordInput,
} from '../../../domain/types/services';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { Env } from '@infrastructure/config';
import { SESSION_REVOCATION_ACTOR } from '@infrastructure/constants';
import { ServiceResultMapper } from '@infrastructure/mappers/shared';
// oxlint-disable-next-line typescript/consistent-type-imports
import { Argon2, Crypto, JwtManager } from '@infrastructure/securities';
import {
  AUTHENTICATION_LOGGER_NAME,
  AUTHENTICATION_PROVIDER_TOKENS,
} from '../../../infrastructure/constants';

@Injectable()
export class LocalAuthenticationService implements ILocalAuthenticationService {
  private readonly logger = new Logger(
    AUTHENTICATION_LOGGER_NAME.SERVICE.LOCAL,
  );

  constructor(
    private readonly jwt_service: JwtManager,
    @Inject(AUTHENTICATION_PROVIDER_TOKENS.REPOSITORIES.USER_ACCOUNT)
    private readonly user_account_repository: IUserAccountRepository,
    @Inject(AUTHENTICATION_PROVIDER_TOKENS.REPOSITORIES.SESSION)
    private readonly session_repository: ISessionRepository,
  ) {}

  private async validateUserExistByEmail(
    email: string,
  ): Promise<ResultPattern<UserAccount, ServiceError>> {
    const accountResult = await this.user_account_repository.findByEmail(email);

    if (accountResult.IsFailure) {
      this.logger.error(accountResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!accountResult.Value) {
      return ServiceResultMapper.Unauthorized(
        API_AUTHENTICATION_MESSAGE.ERROR.INVALID_CREDENTIALS,
      );
    }

    return ServiceResultMapper.Ok(accountResult.Value);
  }

  async login(
    input: TLoginInput,
  ): Promise<ResultPattern<TLoginOutput, ServiceError>> {
    const accountResult = await this.validateUserExistByEmail(input.email);

    if (accountResult.IsFailure) {
      return ResultPattern.Failure(accountResult.Error);
    }

    const account = accountResult.Value;

    const isMatchPasswordResult = await Argon2.verify(
      account.HashedPassword,
      input.password,
    );

    if (isMatchPasswordResult.IsFailure) {
      this.logger.error(isMatchPasswordResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!isMatchPasswordResult.Value) {
      return ServiceResultMapper.Unauthorized(
        API_AUTHENTICATION_MESSAGE.ERROR.INVALID_CREDENTIALS,
      );
    }

    if (!account.IsActive) {
      return ServiceResultMapper.Forbidden(
        API_MESSAGE_GLOBAL.ERROR.ACCOUNT_DISABLED,
      );
    }

    if (account.IsResetPassword) {
      const tokenResult = await this.jwt_service.generatePasswordToken({
        email: account.Email,
      });

      if (tokenResult.IsFailure) {
        this.logger.error(tokenResult.Error);
        return ServiceResultMapper.InternalServerError();
      }

      return ServiceResultMapper.Ok({
        password: {
          password_reset_required: true,
          password_reset_token: tokenResult.Value,
        },
      });
    }

    const sessionResult = await this.openSession(account, input);

    if (sessionResult.IsFailure) {
      return ResultPattern.Failure(sessionResult.Error);
    }

    return ServiceResultMapper.Ok({ access: sessionResult.Value });
  }

  async resetPassword(
    input: TResetPasswordInput,
    passwordToken: string,
  ): Promise<ResultPattern<TResetPasswordOutput, ServiceError>> {
    const verifyTokenResult =
      await this.jwt_service.verifyPasswordTokenIgnoringExpiration(
        passwordToken,
      );

    if (verifyTokenResult.IsFailure) {
      this.logger.error(verifyTokenResult.Error);
      return ServiceResultMapper.Unauthorized(
        API_MESSAGE_GLOBAL.ERROR.INVALID_TOKEN,
      );
    }

    const tokenPolicy = verifyTokenResult.Value;

    if (tokenPolicy.IsExpired) {
      return ServiceResultMapper.Unauthorized(
        API_AUTHENTICATION_MESSAGE.ERROR.PASSWORD_TOKEN_EXPIRED,
      );
    }

    const accountResult = await this.validateUserExistByEmail(
      tokenPolicy.Payload.email,
    );

    if (accountResult.IsFailure) {
      return ResultPattern.Failure(accountResult.Error);
    }

    const account = accountResult.Value;

    if (!account.IsActive) {
      return ServiceResultMapper.Forbidden(
        API_MESSAGE_GLOBAL.ERROR.ACCOUNT_DISABLED,
      );
    }

    if (!account.IsResetPassword) {
      return ServiceResultMapper.Forbidden();
    }

    const hashedPasswordResult = await Argon2.hash(input.new_password);

    if (hashedPasswordResult.IsFailure) {
      this.logger.error(hashedPasswordResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const updateResult =
      await this.user_account_repository.updatePasswordByEmail(
        account.Email,
        hashedPasswordResult.Value,
      );

    if (updateResult.IsFailure) {
      this.logger.error(updateResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const sessionResult = await this.openSession(account, input);

    if (sessionResult.IsFailure) {
      return ResultPattern.Failure(sessionResult.Error);
    }

    return ServiceResultMapper.Ok({ access: sessionResult.Value });
  }

  //Functions
  private async openSession(
    account: UserAccount,
    client: TClientInput,
  ): Promise<ResultPattern<TAuthenticationComplete, ServiceError>> {
    const secretKeyResult = Crypto.generateRandomString(20);

    if (secretKeyResult.IsFailure) {
      this.logger.error(secretKeyResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const [accessTokenResult, refreshTokenResult] = await Promise.all([
      this.jwt_service.generateToken({
        email: account.Email,
        session_key: secretKeyResult.Value,
      }),
      this.jwt_service.generateRefreshToken({
        user_id: account.UserId,
        session_key: secretKeyResult.Value,
      }),
    ]);

    if (accessTokenResult.IsFailure || refreshTokenResult.IsFailure) {
      this.logger.error(
        accessTokenResult.Error ?? refreshTokenResult.Error ?? '',
      );
      return ServiceResultMapper.InternalServerError();
    }

    const hashRefreshTokenResult = await Argon2.hash(refreshTokenResult.Value);

    if (hashRefreshTokenResult.IsFailure) {
      this.logger.error(hashRefreshTokenResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const session = UserSession.register({
      secret_key: secretKeyResult.Value,
      refresh_token_hash: hashRefreshTokenResult.Value,
      status: SESSION_STATUS.ACTIVE,
      requester_ip: client.requester_ip,
      device: client.device,
      browser: client.browser,
      user_id: account.UserId,
      expire_at: null,
    }).generateExpireAt(Env.SESSION_EXPIRES_MS);

    const createSessionResult = await this.session_repository.replaceActive(
      session,
      SESSION_REVOCATION_ACTOR.SYSTEM,
    );

    if (createSessionResult.IsFailure) {
      this.logger.error(createSessionResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    return ServiceResultMapper.Ok({
      access_token: accessTokenResult.Value,
      refresh_token: refreshTokenResult.Value,
    });
  }
}
