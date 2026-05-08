import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ProcessSaleDto } from './dto/process-sale.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class SalesService {
  constructor(private readonly db: DatabaseService) { }

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

  async getSaleDetails(saleId: number) {
    // Verify sale exists
    const saleResult = await this.db.execute(`SELECT * FROM sales WHERE sale_id = :id`, [saleId]);
    if (!saleResult.rows || saleResult.rows.length === 0) {
      throw new NotFoundException('Sale not found');
    }

    const detailsResult = await this.db.execute(
      `SELECT sd.detail_id, sd.sale_id, sd.product_id, sd.quantity, sd.unit_price,
              p.product_name, p.category,
              (sd.quantity * sd.unit_price) AS line_total
       FROM sales_details sd
       JOIN products p ON sd.product_id = p.product_id
       WHERE sd.sale_id = :id
       ORDER BY sd.detail_id`,
      [saleId],
    );

    return {
      sale: saleResult.rows[0],
      details: detailsResult.rows,
    };
  }

  // ─── Horizontal Fragments: Sales ───────────────────────────

  async getSalesGulshan() {
    const result = await this.db.execute(`
    SELECT
      s.sale_id,
      s.store_id,
      st.store_name,
      s.customer_id,
      NVL(c.customer_name, 'Walk-in')                    AS customer_name,
      TO_CHAR(s.sale_date, 'YYYY-MM-DD HH24:MI:SS')      AS sale_date,
      s.total_amt
    FROM sales s
    JOIN stores   st ON s.store_id   = st.store_id
    LEFT JOIN customers c  ON s.customer_id = c.customer_id
    WHERE s.store_id = 1
    ORDER BY s.sale_date DESC
  `);
    return result.rows;
  }

  async getSalesDefense() {
    const result = await this.db.execute(`
    SELECT
      s.sale_id,
      s.store_id,
      st.store_name,
      s.customer_id,
      NVL(c.customer_name, 'Walk-in')                    AS customer_name,
      TO_CHAR(s.sale_date, 'YYYY-MM-DD HH24:MI:SS')      AS sale_date,
      s.total_amt
    FROM sales s
    JOIN stores   st ON s.store_id   = st.store_id
    LEFT JOIN customers c  ON s.customer_id = c.customer_id
    WHERE s.store_id = 2
    ORDER BY s.sale_date DESC
  `);
    return result.rows;
  }

  async getSalesAwami() {
    const result = await this.db.execute(`
    SELECT
      s.sale_id,
      s.store_id,
      st.store_name,
      s.customer_id,
      NVL(c.customer_name, 'Walk-in')                    AS customer_name,
      TO_CHAR(s.sale_date, 'YYYY-MM-DD HH24:MI:SS')      AS sale_date,
      s.total_amt
    FROM sales s
    JOIN stores   st ON s.store_id   = st.store_id
    LEFT JOIN customers c  ON s.customer_id = c.customer_id
    WHERE s.store_id = 3
    ORDER BY s.sale_date DESC
  `);
    return result.rows;
  }
}
