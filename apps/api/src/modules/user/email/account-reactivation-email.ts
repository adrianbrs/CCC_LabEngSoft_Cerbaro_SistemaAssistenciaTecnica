import { AbstractEmailTemplate } from '@/modules/email/templates';

export interface AccountReactivationEmailVariables {
  name: string;
}

export class AccountReactivationEmail extends AbstractEmailTemplate<AccountReactivationEmailVariables> {
  constructor(variables: AccountReactivationEmailVariables) {
    super('account_reactivation_notice', variables);
  }
}
