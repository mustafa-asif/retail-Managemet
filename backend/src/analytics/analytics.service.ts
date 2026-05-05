import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly db: DatabaseService) {}

  async getDashboard() {
    const revResult = await this.db.execute(`SELECT COALESCE(SUM(total_amt), 0) as total_revenue, COUNT(*) as total_transactions FROM sales`);
    const stockResult = await this.db.execute(`
      SELECT 
        SUM(CASE WHEN stock_status = 'LOW STOCK' THEN 1 ELSE 0 END) as low_stock_count,
        SUM(CASE WHEN stock_status = 'OUT OF STOCK' THEN 1 ELSE 0 END) as out_of_stock_count
      FROM mv_inventory_status
    `);
    const bestProdResult = await this.db.execute(`
      SELECT product_name FROM vw_best_selling_products WHERE sales_rank = 1
    `);

    const revRow: any = revResult.rows ? revResult.rows[0] : { TOTAL_REVENUE: 0, TOTAL_TRANSACTIONS: 0 };
    const stockRow: any = stockResult.rows ? stockResult.rows[0] : { LOW_STOCK_COUNT: 0, OUT_OF_STOCK_COUNT: 0 };
    const topProd: any = bestProdResult.rows && bestProdResult.rows.length > 0 ? bestProdResult.rows[0] : { PRODUCT_NAME: 'N/A' };

    return {
      total_revenue: Number(revRow.TOTAL_REVENUE) || 0,
      total_transactions: Number(revRow.TOTAL_TRANSACTIONS) || 0,
      low_stock_count: Number(stockRow.LOW_STOCK_COUNT) || 0,
      out_of_stock_count: Number(stockRow.OUT_OF_STOCK_COUNT) || 0,
      top_product: topProd.PRODUCT_NAME,
    };
  }

  async getStoreSummary() {
    const result = await this.db.execute(`SELECT * FROM vw_store_sales_summary`);
    return result.rows;
  }

  async getBestSelling() {
    const result = await this.db.execute(`SELECT * FROM vw_best_selling_products`);
    return result.rows;
  }

  async getMonthlySales() {
    const result = await this.db.execute(`SELECT * FROM vw_monthly_sales`);
    return result.rows;
  }

  async getActiveProducts() {
    const result = await this.db.execute(`SELECT * FROM vw_union_active_products`);
    return result.rows;
  }

  async getSoldAndStocked() {
    const result = await this.db.execute(`SELECT * FROM vw_intersect_sold_and_stocked`);
    return result.rows;
  }

  async getUnsoldProducts() {
    const result = await this.db.execute(`SELECT * FROM vw_minus_unsold_products`);
    return result.rows;
  }
}
