import { Controller, Get, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) { }

  @Get('dashboard')
  getDashboard() {
    return this.analyticsService.getDashboard();
  }

  @Get('store-summary')
  getStoreSummary() {
    return this.analyticsService.getStoreSummary();
  }

  @Get('best-selling')
  getBestSelling() {
    return this.analyticsService.getBestSelling();
  }

  @Get('monthly-sales')
  getMonthlySales() {
    return this.analyticsService.getMonthlySales();
  }

  @Get('active-products')
  getActiveProducts() {
    return this.analyticsService.getActiveProducts();
  }

  @Get('sold-and-stocked')
  getSoldAndStocked() {
    return this.analyticsService.getSoldAndStocked();
  }

  @Get('unsold-products')
  getUnsoldProducts() {
    return this.analyticsService.getUnsoldProducts();
  }

  @Get('store-performance/:storeId')
  getStorePerformance(@Param('storeId') storeId: string) {
    return this.analyticsService.getStorePerformance(+storeId);
  }
}
