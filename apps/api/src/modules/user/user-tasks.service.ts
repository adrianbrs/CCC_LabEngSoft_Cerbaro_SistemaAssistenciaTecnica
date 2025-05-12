import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { User } from './models/user.entity';
import { Raw } from 'typeorm';

@Injectable()
export class UserTasksService {
  private logger = new Logger(UserTasksService.name);

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  async deleteOldUsers() {
    this.logger.log('Deleting old users...');

    const result = await User.delete({
      deletedAt: Raw(
        (alias) =>
          `${alias} IS NOT NULL AND ${alias} < NOW() - INTERVAL '30 days'`,
      ),
    });

    this.logger.log(`Deleted ${result.affected} old users.`);
  }
}
