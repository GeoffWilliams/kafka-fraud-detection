// https://github.com/elysiajs/elysia/issues/313#issuecomment-2005949657
import type { StatusCodes } from 'http-status-codes';

export class APIError extends Error {
  public readonly message: string;
  public readonly httpCode: StatusCodes;

  constructor(httpCode: StatusCodes, message: string, options?: ErrorOptions) {
    super(message, options);

    this.httpCode = httpCode;
    this.message = message;
    this.name = 'APIError';

    Object.setPrototypeOf(this, APIError.prototype);
    Error.captureStackTrace(this);
  }
}