import { AbstractEmailTemplate } from '@/modules/email/templates';

export interface AccountRoleChangedEmailVariables {
  name: string;
  role: string;
}

export class AccountRoleChangedEmail extends AbstractEmailTemplate<AccountRoleChangedEmailVariables> {
  constructor(variables: AccountRoleChangedEmailVariables) {
    super('role_changed', variables);
  }
}
