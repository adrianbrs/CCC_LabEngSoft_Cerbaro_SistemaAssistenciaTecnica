export class AppError extends Error {
  constructor(message: string) {
    super(message);

    if (this.name === "Error") {
      this.name = this.constructor.name;
    }
  }
}
