export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
    // Restore prototype chain — required when extending built-ins in TS
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
