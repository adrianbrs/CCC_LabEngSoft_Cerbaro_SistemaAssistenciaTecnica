import { AbstractEmailTemplate } from '@/modules/email/templates';

interface PasswordChangedEmailVariables {
  name: string;
}

export class PasswordChangedEmail extends AbstractEmailTemplate<PasswordChangedEmailVariables> {
  constructor(variables: PasswordChangedEmailVariables) {
    super('password_changed', variables);
  }
}
