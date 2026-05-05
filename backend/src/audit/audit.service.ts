import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class AuditService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(pagination: PaginationDto) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const start_row = (page - 1) * limit;
    const end_row = page * limit;

    const sql = `
      SELECT * FROM (
        SELECT t.*, ROWNUM rn FROM (
          SELECT * FROM inventory_audit ORDER BY changed_at DESC
        ) t WHERE ROWNUM <= :end_row
      ) WHERE rn > :start_row
    `;

    const result = await this.db.execute(sql, { start_row, end_row });
    const countResult = await this.db.execute(`SELECT COUNT(*) as TOTAL FROM inventory_audit`);
    return { data: result.rows, total: (countResult.rows as any)[0].TOTAL };
  }

  async findByStore(storeId: number, pagination: PaginationDto) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const start_row = (page - 1) * limit;
    const end_row = page * limit;

    const sql = `
      SELECT * FROM (
        SELECT t.*, ROWNUM rn FROM (
          SELECT * FROM inventory_audit WHERE store_id = :storeId ORDER BY changed_at DESC
        ) t WHERE ROWNUM <= :end_row
      ) WHERE rn > :start_row
    `;

    const result = await this.db.execute(sql, { storeId, start_row, end_row });
    const countResult = await this.db.execute(`SELECT COUNT(*) as TOTAL FROM inventory_audit WHERE store_id = :storeId`, { storeId });
    return { data: result.rows, total: (countResult.rows as any)[0].TOTAL };
  }
}
