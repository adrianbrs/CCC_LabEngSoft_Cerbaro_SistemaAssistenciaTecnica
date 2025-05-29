import { Product } from '@/modules/product/models/product.entity';
import { IsNotEmpty, Length } from 'class-validator';

export class TicketCreateDto {
  @IsNotEmpty()
  productId: Product['id'];

  @IsNotEmpty()
  @Length(10, 1000)
  description: string;

  @IsNotEmpty()
  @Length(1, 500)
  serialNumber: string;
}
