import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as oracledb from 'oracledb';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: oracledb.Pool;

  async onModuleInit(): Promise<void> {
    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
    this.pool = await oracledb.createPool({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectionString: process.env.ORACLE_CONNECTION_STRING,
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 1,
    });
    console.log('Oracle connection pool created');
  }

  async execute<T = any>(
    sql: string,
    binds: any[] | Record<string, any> = [],
    opts: oracledb.ExecuteOptions = {},
  ): Promise<oracledb.Result<T>> {
    const conn = await this.pool.getConnection();
    try {
      return await conn.execute<T>(sql, binds, { autoCommit: true, ...opts });
    } finally {
      await conn.close();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.close(10);
    console.log('Oracle connection pool closed');
  }
}
