import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { UserLoginDto } from './dtos/user-login.dto';
import { Request, Response } from 'express';
import { CsrfUpdate } from '../csrf/csrf.decorator';
import { AuthService } from './auth.service';
import { Public } from './auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Authenticates a user using the provided email and password and creates a session.
   */
  @CsrfUpdate()
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() loginDto: UserLoginDto,
  ) {
    return this.authService.login(req, res, loginDto);
  }

  /**
   * Logs out the user by destroying the session.
   */
  @CsrfUpdate()
  @Public()
  @Delete('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req, res);
  }
}
