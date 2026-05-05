import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ProcessSaleDto } from './dto/process-sale.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class SalesService {
  constructor(private readonly db: DatabaseService) {}

  async processSale(dto: ProcessSaleDto) {
    await this.db.execute(
      `BEGIN process_sale(:store_id, :product_id, :quantity, :customer_id); END;`,
      {
        store_id: dto.store_id,
        product_id: dto.product_id,
        quantity: dto.quantity,
        customer_id: dto.customer_id ?? null,
      },
    );
    return { message: 'Sale processed successfully' };
  }

  async findAll(pagination: PaginationDto, fromDate?: string, toDate?: string) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const start_row = (page - 1) * limit;
    const end_row = page * limit;

    let baseQuery = `SELECT * FROM sales WHERE 1=1 `;
    let countQuery = `SELECT COUNT(*) as TOTAL FROM sales WHERE 1=1 `;
    let binds: any = {};

    if (fromDate) {
      baseQuery += ` AND sale_date >= TO_DATE(:from_date, 'YYYY-MM-DD') `;
      countQuery += ` AND sale_date >= TO_DATE(:from_date, 'YYYY-MM-DD') `;
      binds.from_date = fromDate;
    }
    if (toDate) {
      baseQuery += ` AND sale_date <= TO_DATE(:to_date, 'YYYY-MM-DD') + 1 `;
      countQuery += ` AND sale_date <= TO_DATE(:to_date, 'YYYY-MM-DD') + 1 `;
      binds.to_date = toDate;
    }

    baseQuery += ` ORDER BY sale_date DESC `;

    const sql = `
      SELECT * FROM (
        SELECT t.*, ROWNUM rn FROM (
          ${baseQuery}
        ) t WHERE ROWNUM <= :end_row
      ) WHERE rn > :start_row
    `;

    binds.start_row = start_row;
    binds.end_row = end_row;

    const result = await this.db.execute(sql, binds);
    
    // For total count query, we only need from_date and to_date
    let countBinds: any = {};
    if (fromDate) countBinds.from_date = fromDate;
    if (toDate) countBinds.to_date = toDate;

    const totalResult = await this.db.execute(countQuery, countBinds);
    return { data: result.rows, total: (totalResult.rows as any)[0].TOTAL };
  }

  async findOne(id: number) {
    const saleResult = await this.db.execute(`SELECT * FROM sales WHERE sale_id = :id`, [id]);
    if (!saleResult.rows || saleResult.rows.length === 0) throw new NotFoundException('Sale not found');
    const detailsResult = await this.db.execute(`SELECT * FROM sales_details WHERE sale_id = :id`, [id]);
    const sale: any = saleResult.rows[0];
    sale.details = detailsResult.rows;
    return sale;
  }

  async findByStore(storeId: number) {
    const result = await this.db.execute(`SELECT * FROM sales WHERE store_id = :storeId ORDER BY sale_date DESC`, [storeId]);
    return result.rows;
  }

  async findByCustomer(customerId: number) {
    const result = await this.db.execute(`SELECT * FROM sales WHERE customer_id = :customerId ORDER BY sale_date DESC`, [customerId]);
    return result.rows;
  }
}
