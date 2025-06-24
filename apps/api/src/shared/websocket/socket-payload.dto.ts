import { ICoreEventPayload } from '@musat/core';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { ResponseDto } from '../response.dto';

export abstract class SocketPayloadDto
  extends ResponseDto
  implements ICoreEventPayload
{
  @IsNotEmpty()
  @IsNumber()
  timestamp: number = Date.now();
}
