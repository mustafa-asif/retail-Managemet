import { IsNumber, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ProcessSaleDto {
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
  @Min(1)
  quantity: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  customer_id?: number;
}
