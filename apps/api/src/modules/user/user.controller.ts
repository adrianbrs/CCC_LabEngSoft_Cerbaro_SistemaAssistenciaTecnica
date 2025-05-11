import {
  Body,
  Controller,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { User } from './models/user.entity';
import { AccountVerificationError } from './errors/account-verification.error';
import { UserVerifyDto } from './dtos/user-verify.dto';

@Controller('users')
export class UserController {
  /**
   * Verifies a user's email address using the provided token.
   */
  @Post('/:userId/verify')
  @HttpCode(200)
  async verify(
    @Param('userId', new ParseUUIDPipe({ version: '4' })) userId: string,
    @Body() { token }: UserVerifyDto,
  ) {
    const user = await User.verify(userId, token);
    if (!user) {
      throw new AccountVerificationError();
    }
  }
}
