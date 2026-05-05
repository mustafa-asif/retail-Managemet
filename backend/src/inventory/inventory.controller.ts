import { Controller, Get, Post, Body, Put, Param } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('status')
  getStatusCount() {
    return this.inventoryService.getStatusCount();
  }

  @Post('refresh-mv')
  refreshMv() {
    return this.inventoryService.refreshMaterializedView();
  }

  @Get('store/:storeId')
  findByStore(@Param('storeId') storeId: string) {
    return this.inventoryService.findByStore(+storeId);
  }

  @Post()
  create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(createInventoryDto);
  }

  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateInventoryDto: UpdateInventoryDto) {
    return this.inventoryService.update(+id, updateInventoryDto);
  }
}
