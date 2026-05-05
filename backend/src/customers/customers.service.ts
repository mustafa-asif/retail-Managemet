import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly db: DatabaseService) {}

  async create(createCustomerDto: CreateCustomerDto) {
    const sql = `INSERT INTO customers (customer_name, email, phone, city) VALUES (:customer_name, :email, :phone, :city) RETURNING customer_id INTO :out_id`;
    const result = await this.db.execute(sql, {
      customer_name: createCustomerDto.customer_name,
      email: createCustomerDto.email || null,
      phone: createCustomerDto.phone || null,
      city: createCustomerDto.city || null,
      out_id: { type: require('oracledb').NUMBER, dir: require('oracledb').BIND_OUT },
    });
    return { ...createCustomerDto, customer_id: (result.outBinds as any).out_id[0] };
  }

  async findAll(pagination: PaginationDto) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const start_row = (page - 1) * limit;
    const end_row = page * limit;

    const query = `
      SELECT * FROM (
        SELECT t.*, ROWNUM rn FROM (
          SELECT * FROM customers ORDER BY customer_id DESC
        ) t WHERE ROWNUM <= :end_row
      ) WHERE rn > :start_row
    `;
    const result = await this.db.execute(query, { start_row, end_row });
    const totalResult = await this.db.execute(`SELECT COUNT(*) as TOTAL FROM customers`);
    return { data: result.rows, total: (totalResult.rows as any)[0].TOTAL };
  }

  async findOne(id: number) {
    const result = await this.db.execute(`SELECT * FROM customers WHERE customer_id = :id`, [id]);
    if (!result.rows || result.rows.length === 0) throw new NotFoundException('Customer not found');
    return result.rows[0];
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    const customer: any = await this.findOne(id);
    await this.db.execute(
      `UPDATE customers SET customer_name = :n, email = :e, phone = :p, city = :c WHERE customer_id = :id`,
      {
        n: updateCustomerDto.customer_name !== undefined ? updateCustomerDto.customer_name : customer.CUSTOMER_NAME,
        e: updateCustomerDto.email !== undefined ? updateCustomerDto.email : customer.EMAIL,
        p: updateCustomerDto.phone !== undefined ? updateCustomerDto.phone : customer.PHONE,
        c: updateCustomerDto.city !== undefined ? updateCustomerDto.city : customer.CITY,
        id,
      }
    );
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.db.execute(`DELETE FROM customers WHERE customer_id = :id`, [id]);
    return { message: 'Customer deleted successfully' };
  }
}
