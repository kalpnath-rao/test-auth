import { HttpException, HttpStatus } from '@nestjs/common';

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  reasons: { message: string }[];
}

const HTTP_MESSAGES = {
  422: 'UnprocessableEntity',
  401: 'Unauthorized',
  500: 'BadImplementation',
  429: 'LimitExhausted',
  410: 'InvalidOrExpiredToken',
};

export class ApiException extends HttpException {
  static badData(...errors: string[]): never {
    throw new ApiException(null, HttpStatus.UNPROCESSABLE_ENTITY, ...errors);
  }
  static badDataWith(data: object, ...errors: string[]): never {
    throw new ApiException(data, HttpStatus.UNPROCESSABLE_ENTITY, ...errors);
  }
  static unAuthorized(...errors: string[]): never {
    throw new ApiException(null, HttpStatus.UNAUTHORIZED, ...errors);
  }
  static badImplementation(...errors: string[]): never {
    throw new ApiException(null, HttpStatus.INTERNAL_SERVER_ERROR, ...errors);
  }
  static exhausted(...errors: string[]): never {
    throw new ApiException(null, HttpStatus.TOO_MANY_REQUESTS, ...errors);
  }
  static exhaustedWith(data: object, ...errors: string[]): never {
    throw new ApiException(data, HttpStatus.TOO_MANY_REQUESTS, ...errors);
  }
  static linkExpired(...errors: string[]): never {
    throw new ApiException(null, HttpStatus.GONE, ...errors);
  }
  getResponse!: () => ErrorResponse;
  data?: object;
  constructor(data: object | null, status: HttpStatus, ...reasons: string[]) {
    super(
      {
        statusCode: status,
        error: HTTP_MESSAGES[status],
        message: reasons[0],
        reasons: reasons.map((message) => ({ message })),
      },
      status,
    );
    if (data) {
      this.data = data;
    }
  }
}
