import { AbstractEmailTemplate } from '@/modules/email/templates';

export interface AccountVerificationEmailVariables {
  name: string;
  verificationUrl: string;
}

export class AccountVerificationEmail extends AbstractEmailTemplate<AccountVerificationEmailVariables> {
  constructor(variables: AccountVerificationEmailVariables) {
    super('verify_email', variables);
  }
}
