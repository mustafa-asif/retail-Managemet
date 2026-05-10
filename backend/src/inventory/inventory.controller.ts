import { Controller, Get, Post, Body, Put, Param ,Delete} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { RestockInventoryDto } from './dto/restock-inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) { }

  @Get('status')
  getStatusCount() {
    return this.inventoryService.getStatusCount();
  }

  @Post('refresh-mv')
  refreshMv() {
    return this.inventoryService.refreshMaterializedView();
  }

  @Post('restock')
  restock(@Body() restockDto: RestockInventoryDto) {
    return this.inventoryService.restock(restockDto.items);
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

  

  // ── Fragmentation routes ──────────────────────────
  // IMPORTANT: these must go BEFORE @Get(':id') if you have one
  // to avoid NestJS matching 'gulshan' as an id param

  @Get('fragment/gulshan')
  getFragGulshan() {
    return this.inventoryService.getFragGulshan();
  }

  @Get('fragment/defense')
  getFragDefense() {
    return this.inventoryService.getFragDefense();
  }

  @Get('fragment/awami')
  getFragAwami() {
    return this.inventoryService.getFragAwami();
  }

  @Get('low-stock')
  getLowStock() {
    return this.inventoryService.getLowStock();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateInventoryDto: UpdateInventoryDto) {
    return this.inventoryService.update(+id, updateInventoryDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.inventoryService.delete(+id);
  }
}
