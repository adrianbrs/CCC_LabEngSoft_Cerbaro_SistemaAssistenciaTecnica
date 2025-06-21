import { Product } from '@/modules/product/models/product.entity';
import { IsNotEmpty, IsUUID, Length } from 'class-validator';

export class TicketCreateDto {
  @IsNotEmpty()
  @IsUUID('4')
  productId: Product['id'];

  @IsNotEmpty()
  @Length(10, 1000)
  description: string;

  @IsNotEmpty()
  @Length(1, 500)
  serialNumber: string;
}
