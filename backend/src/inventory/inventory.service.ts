import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly db: DatabaseService) {}

  async create(createInventoryDto: CreateInventoryDto) {
    const sql = `INSERT INTO inventory (store_id, product_id, quantity) VALUES (:s, :p, :q) RETURNING inventory_id INTO :out_id`;
    const result = await this.db.execute(sql, {
      s: createInventoryDto.store_id,
      p: createInventoryDto.product_id,
      q: createInventoryDto.quantity,
      out_id: { type: require('oracledb').NUMBER, dir: require('oracledb').BIND_OUT },
    });
    return { ...createInventoryDto, inventory_id: (result.outBinds as any).out_id[0] };
  }

  async findAll() {
    const result = await this.db.execute(`SELECT * FROM mv_inventory_status`);
    return result.rows;
  }

  async findByStore(storeId: number) {
    const result = await this.db.execute(`SELECT * FROM mv_inventory_status WHERE store_id = :storeId`, { storeId });
    return result.rows;
  }

  async getStatusCount() {
    const result = await this.db.execute(`SELECT stock_status, COUNT(*) as count FROM mv_inventory_status GROUP BY stock_status`);
    return result.rows;
  }

  async update(id: number, updateInventoryDto: UpdateInventoryDto) {
    const check = await this.db.execute(`SELECT * FROM inventory WHERE inventory_id = :id`, [id]);
    if (!check.rows || check.rows.length === 0) throw new NotFoundException('Inventory not found');
    const inv: any = check.rows[0];

    await this.db.execute(
      `UPDATE inventory SET store_id = :s, product_id = :p, quantity = :q WHERE inventory_id = :id`,
      {
        s: updateInventoryDto.store_id !== undefined ? updateInventoryDto.store_id : inv.STORE_ID,
        p: updateInventoryDto.product_id !== undefined ? updateInventoryDto.product_id : inv.PRODUCT_ID,
        q: updateInventoryDto.quantity !== undefined ? updateInventoryDto.quantity : inv.QUANTITY,
        id,
      }
    );
    const updated = await this.db.execute(`SELECT * FROM inventory WHERE inventory_id = :id`, [id]);
    return updated.rows![0];
  }

  async refreshMaterializedView() {
    await this.db.execute(`BEGIN DBMS_MVIEW.REFRESH('MV_INVENTORY_STATUS', 'C'); END;`);
    return { message: 'Materialized view refreshed successfully' };
  }
}
