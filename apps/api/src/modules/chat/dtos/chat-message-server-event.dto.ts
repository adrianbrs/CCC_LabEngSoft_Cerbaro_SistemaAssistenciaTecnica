import { IChatMessageServerEvent } from '@musat/core';
import { OmitType } from '@nestjs/swagger';
import { ChatMessageClientEventDto } from './chat-message-client-event.dto';

export class ChatMessageServerEventDto
  extends OmitType(ChatMessageClientEventDto, ['from'])
  implements IChatMessageServerEvent {}
