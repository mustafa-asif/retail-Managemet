import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class AuditService {
  constructor(private readonly db: DatabaseService) { }

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

  // ─── Audit Summary ───

  async getAuditSummary(month?: string) {
    let sql = `SELECT * FROM audit_summary`;
    const binds: Record<string, string> = {};

    if (month) {
      sql += ` WHERE summary_month = :month`;
      binds.month = month;
    }

    sql += ` ORDER BY last_updated DESC`;
    const result = await this.db.execute(sql, binds);
    return result.rows;
  }

  // ─── DML Audit Log ───

  async getDmlAuditLog(table?: string, action?: string) {
    let sql = `SELECT * FROM dml_audit_log WHERE 1=1`;
    const binds: Record<string, string> = {};

    if (table) {
      sql += ` AND UPPER(table_name) = UPPER(:table_name)`;
      binds.table_name = table;
    }
    if (action) {
      sql += ` AND UPPER(action) = UPPER(:action)`;
      binds.action = action;
    }

    sql += ` ORDER BY performed_at DESC`;
    const result = await this.db.execute(sql, binds);
    return result.rows;
  }
}
