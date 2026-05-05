import { Controller, Get, Param, Query } from '@nestjs/common';
import { AuditService } from './audit.service';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('store/:storeId')
  findByStore(@Param('storeId') storeId: string, @Query() pagination: PaginationDto) {
    return this.auditService.findByStore(+storeId, pagination);
  }

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.auditService.findAll(pagination);
  }
}
