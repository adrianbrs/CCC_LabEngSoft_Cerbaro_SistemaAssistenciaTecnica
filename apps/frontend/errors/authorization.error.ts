import { AppError } from "./app.error";

export class AuthorizationError extends AppError {
  constructor(message = "Acesso não autorizado") {
    super(message);
  }
}
