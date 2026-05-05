import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { SalesService } from './sales.service';
import { ProcessSaleDto } from './dto/process-sale.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post('process')
  processSale(@Body() processSaleDto: ProcessSaleDto) {
    return this.salesService.processSale(processSaleDto);
  }

  @Get('store/:storeId')
  findByStore(@Param('storeId') storeId: string) {
    return this.salesService.findByStore(+storeId);
  }

  @Get('customer/:customerId')
  findByCustomer(@Param('customerId') customerId: string) {
    return this.salesService.findByCustomer(+customerId);
  }

  @Get()
  findAll(
    @Query() pagination: PaginationDto,
    @Query('from') fromDate?: string,
    @Query('to') toDate?: string,
  ) {
    return this.salesService.findAll(pagination, fromDate, toDate);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(+id);
  }
}
