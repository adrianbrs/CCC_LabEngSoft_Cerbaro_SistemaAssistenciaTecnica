import { AbstractEmailTemplate } from '@/modules/email/templates';

interface PasswordRecoveryEmailVariables {
  name: string;
  resetUrl: string;
}

export class PasswordRecoveryEmail extends AbstractEmailTemplate<PasswordRecoveryEmailVariables> {
  constructor(variables: PasswordRecoveryEmailVariables) {
    super('password_recovery', variables);
  }
}
