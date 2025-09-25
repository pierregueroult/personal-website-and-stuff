import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

import { InteractionAction } from '../../enum/blog/action';

export class CreateInteractionDto {
  @IsNotEmpty()
  @IsString()
  articleId: string;

  @IsEnum(InteractionAction)
  action: InteractionAction;

  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @IsOptional()
  @IsString()
  metadata?: string;
}
