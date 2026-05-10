import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from "@nestjs/common";
import * as oracledb from "oracledb";
import { DatabaseService } from "../database/database.service";
import { CreateInventoryDto } from "./dto/create-inventory.dto";
import { UpdateInventoryDto } from "./dto/update-inventory.dto";
import { RestockItemDto } from "./dto/restock-inventory.dto";

@Injectable()
export class InventoryService {
  constructor(private readonly db: DatabaseService) {}

  async create(createInventoryDto: CreateInventoryDto) {
    const sql = `INSERT INTO inventory (store_id, product_id, quantity) VALUES (:s, :p, :q) RETURNING inventory_id INTO :out_id`;
    const result = await this.db.execute(sql, {
      s: createInventoryDto.store_id,
      p: createInventoryDto.product_id,
      q: createInventoryDto.quantity,
      out_id: {
        type: require("oracledb").NUMBER,
        dir: require("oracledb").BIND_OUT,
      },
    });
    return {
      ...createInventoryDto,
      inventory_id: (result.outBinds as any).out_id[0],
    };
  }

  async findAll() {
    const result = await this.db.execute(`SELECT * FROM mv_inventory_status`);
    return result.rows;
  }

  async findByStore(storeId: number) {
    const result = await this.db.execute(
      `SELECT * FROM mv_inventory_status WHERE store_id = :storeId`,
      { storeId },
    );
    return result.rows;
  }

  async getStatusCount() {
    const result = await this.db.execute(
      `SELECT stock_status, COUNT(*) as count FROM mv_inventory_status GROUP BY stock_status`,
    );
    return result.rows;
  }

  async update(id: number, updateInventoryDto: UpdateInventoryDto) {
    const check = await this.db.execute(
      `SELECT * FROM inventory WHERE inventory_id = :id`,
      [id],
    );
    if (!check.rows || check.rows.length === 0)
      throw new NotFoundException("Inventory not found");
    const inv: any = check.rows[0];

    await this.db.execute(
      `UPDATE inventory SET store_id = :s, product_id = :p, quantity = :q WHERE inventory_id = :id`,
      {
        s:
          updateInventoryDto.store_id !== undefined
            ? updateInventoryDto.store_id
            : inv.STORE_ID,
        p:
          updateInventoryDto.product_id !== undefined
            ? updateInventoryDto.product_id
            : inv.PRODUCT_ID,
        q:
          updateInventoryDto.quantity !== undefined
            ? updateInventoryDto.quantity
            : inv.QUANTITY,
        id,
      },
    );
    const updated = await this.db.execute(
      `SELECT * FROM inventory WHERE inventory_id = :id`,
      [id],
    );
    return updated.rows![0];
  }
  // with store id and product id as well, we can check if the inventory exists before deleting, to avoid deleting non-existing inventory and also to provide a more informative error message if the inventory does not exist. This is especially useful in cases where the inventory_id might be auto-generated and not known beforehand.
  async delete(id: number) {
    const check = await this.db.execute(
      `SELECT * FROM inventory WHERE inventory_id = :id`,
      [id],
    );
    if (!check.rows || check.rows.length === 0)
      throw new NotFoundException("Inventory not found");
    await this.db.execute(`DELETE FROM inventory WHERE inventory_id = :id`, [
      id,
    ]);
    return { message: "Inventory deleted successfully" };
  }

  async refreshMaterializedView() {
    await this.db.execute(
      `BEGIN DBMS_MVIEW.REFRESH('MV_INVENTORY_STATUS', 'C'); END;`,
    );
    return { message: "Materialized view refreshed successfully" };
  }

  async restock(items: RestockItemDto[]) {
    // Use raw connection for transaction control (commit all or rollback all)
    const pool = oracledb.getPool();
    const conn = await pool.getConnection();
    try {
      for (const item of items) {
        await conn.execute(
          `UPDATE inventory SET quantity = quantity + :qty
           WHERE store_id = :store_id AND product_id = :product_id`,
          {
            qty: item.quantity,
            store_id: item.store_id,
            product_id: item.product_id,
          },
        );
      }
      await conn.commit();

      // Refresh MV on same connection AFTER commit
      await conn.execute(
        `BEGIN DBMS_MVIEW.REFRESH('MV_INVENTORY_STATUS', 'C'); END;`,
      );
      return { message: `${items.length} item(s) restocked successfully` };
    } catch (error) {
      await conn.rollback();
      throw new InternalServerErrorException(
        "Restock failed: " + (error as Error).message,
      );
    } finally {
      await conn.close();
    }
  }

  // Horizontal fragments
  async getFragGulshan() {
    const result = await this.db.execute(`
    SELECT i.inventory_id, i.store_id, i.product_id,
           p.product_name, p.category, p.price, i.quantity,
           CASE
             WHEN i.quantity = 0  THEN 'OUT OF STOCK'
             WHEN i.quantity < 10 THEN 'LOW STOCK'
             ELSE 'IN STOCK'
           END AS stock_status
    FROM inventory i
    JOIN products p ON i.product_id = p.product_id
    WHERE i.store_id = 1
    ORDER BY i.product_id
  `);
    return result.rows;
  }

  async getFragDefense() {
    const result = await this.db.execute(`
    SELECT i.inventory_id, i.store_id, i.product_id,
           p.product_name, p.category, p.price, i.quantity,
           CASE
             WHEN i.quantity = 0  THEN 'OUT OF STOCK'
             WHEN i.quantity < 10 THEN 'LOW STOCK'
             ELSE 'IN STOCK'
           END AS stock_status
    FROM inventory i
    JOIN products p ON i.product_id = p.product_id
    WHERE i.store_id = 2
    ORDER BY i.product_id
  `);
    return result.rows;
  }

  async getFragAwami() {
    const result = await this.db.execute(`
    SELECT i.inventory_id, i.store_id, i.product_id,
           p.product_name, p.category, p.price, i.quantity,
           CASE
             WHEN i.quantity = 0  THEN 'OUT OF STOCK'
             WHEN i.quantity < 10 THEN 'LOW STOCK'
             ELSE 'IN STOCK'
           END AS stock_status
    FROM inventory i
    JOIN products p ON i.product_id = p.product_id
    WHERE i.store_id = 3
    ORDER BY i.product_id
  `);
    return result.rows;
  }

  // Low stock
  async getLowStock() {
    const result = await this.db.execute(`
    SELECT i.inventory_id, i.store_id, st.store_name,
           i.product_id, p.product_name, p.category,
           i.quantity
    FROM inventory i
    JOIN stores   st ON i.store_id   = st.store_id
    JOIN products p  ON i.product_id = p.product_id
    WHERE i.quantity <=10
    ORDER BY i.quantity ASC
  `);
    return result.rows;
  }
}
