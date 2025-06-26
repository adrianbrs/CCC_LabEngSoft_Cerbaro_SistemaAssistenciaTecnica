import { AbstractEmailTemplate } from '@/modules/email/templates';

export interface AccountDeactivationEmailVariables {
  name: string;
}

export class AccountDeactivationEmail extends AbstractEmailTemplate<AccountDeactivationEmailVariables> {
  constructor(variables: AccountDeactivationEmailVariables) {
    super('account_deactivation_notice', variables);
  }
}
