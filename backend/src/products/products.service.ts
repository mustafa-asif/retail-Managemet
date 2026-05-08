import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly db: DatabaseService) {}

 async create(createProductDto: CreateProductDto) {
  await this.db.execute(
    `INSERT INTO products (product_name, category, price) VALUES (:product_name, :category, :price)`,
    {
      product_name: createProductDto.product_name,
      category: createProductDto.category || null,
      price: createProductDto.price,
    }
  );

  const result = await this.db.execute(
    `SELECT * FROM products WHERE product_name = :name ORDER BY product_id DESC FETCH FIRST 1 ROW ONLY`,
    { name: createProductDto.product_name }
  );

  return (result.rows as any[])[0];
}

  async findAll(category?: string) {
    let sql = `SELECT * FROM products`;
    let binds: any[] = [];
    if (category) {
      sql += ` WHERE category = :1`;
      binds.push(category);
    }
    sql += ` ORDER BY product_id ASC`;
    const result = await this.db.execute(sql, binds);
    return result.rows;
  }

  async findOne(id: number) {
    const result = await this.db.execute(`SELECT * FROM products WHERE product_id = :id`, [id]);
    if (!result.rows || result.rows.length === 0) throw new NotFoundException('Product not found');
    return result.rows[0];
  }

  async findByCategory(category: string) {
    const result = await this.db.execute(`SELECT * FROM products WHERE category = :cat ORDER BY product_id ASC`, { cat: category });
    return result.rows;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product: any = await this.findOne(id);
    await this.db.execute(
      `UPDATE products SET product_name = :n, category = :c, price = :p WHERE product_id = :id`,
      {
        n: updateProductDto.product_name !== undefined ? updateProductDto.product_name : product.PRODUCT_NAME,
        c: updateProductDto.category !== undefined ? updateProductDto.category : product.CATEGORY,
        p: updateProductDto.price !== undefined ? updateProductDto.price : product.PRICE,
        id,
      }
    );
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.db.execute(`DELETE FROM products WHERE product_id = :id`, [id]);
    return { message: 'Product deleted successfully' };
  }
}
