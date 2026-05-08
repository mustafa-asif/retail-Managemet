import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoresService {
  constructor(private readonly db: DatabaseService) {}

  async create(createStoreDto: CreateStoreDto) {
    const sql = `INSERT INTO stores (store_name, location) VALUES (:store_name, :location)`;
    const result = await this.db.execute(sql, {
      store_name: createStoreDto.store_name,
      location: createStoreDto.location,

    });
    return { store_id: result.lastRowid, store_name: createStoreDto.store_name, location: createStoreDto.location };
  }

  async findAll() {
    const result = await this.db.execute(`SELECT * FROM stores ORDER BY store_id ASC`);
    return result.rows;
  }

  async findOne(id: number) {
    const result = await this.db.execute(`SELECT * FROM stores WHERE store_id = :id`, [id]);
    if (!result.rows || result.rows.length === 0) throw new NotFoundException('Store not found');
    return result.rows[0];
  }

  async update(id: number, updateStoreDto: UpdateStoreDto) {
    const store: any = await this.findOne(id);
    const sn = updateStoreDto.store_name !== undefined ? updateStoreDto.store_name : store.STORE_NAME;
    const loc = updateStoreDto.location !== undefined ? updateStoreDto.location : store.LOCATION;
    
    await this.db.execute(
      `UPDATE stores SET store_name = :store_name, location = :location WHERE store_id = :id`,
      { store_name: sn, location: loc, id }
    );
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.db.execute(`DELETE FROM stores WHERE store_id = :id`, [id]);
    return { message: 'Store deleted successfully' };
  }
}
