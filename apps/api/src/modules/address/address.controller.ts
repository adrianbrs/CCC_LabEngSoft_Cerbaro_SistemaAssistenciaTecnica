import { Controller, Get, Param } from '@nestjs/common';
import { AddressService } from './address.service';
import { Public } from '../auth/auth.decorator';

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Public()
  @Get('/cep/:cep')
  getCepInfo(@Param('cep') cep: string) {
    return this.addressService.getCepInfo(cep);
  }
}
