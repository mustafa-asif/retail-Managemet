import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInventoryDto {
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  store_id: number;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  product_id: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  quantity: number;
}
