export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string = code,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
