import { IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class RestockItemDto {
    @IsNumber()
    @Min(1)
    store_id: number;

    @IsNumber()
    @Min(1)
    product_id: number;

    @IsNumber()
    @Min(1)
    quantity: number;
}

export class RestockInventoryDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RestockItemDto)
    items: RestockItemDto[];
}
