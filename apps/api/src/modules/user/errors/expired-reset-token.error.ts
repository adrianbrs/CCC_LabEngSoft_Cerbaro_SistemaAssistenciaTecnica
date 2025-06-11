import { ApiError } from "@/shared/api.error";
import { HttpStatus } from '@nestjs/common';

export class ExpiredResetToken extends ApiError{
    constructor(){
        super(
            'EXPIRED RESET PASSWORD TOKEN',
            'expired reset password token',
            HttpStatus.BAD_REQUEST,
        )
    }
}