# Save Mart — Retail Management Backend (Full Context)

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Framework   | NestJS 10 (TypeScript)              |
| Database    | Oracle XE (via `oracledb` 6.x)     |
| Port        | `5000` (env: `PORT`)               |
| Global Prefix | `/api`                            |
| CORS Origin | env `FRONTEND_URL` (default `*`)   |

---

## Project Structure

```
src/
├── main.ts                          # Bootstrap, global prefix, pipes, interceptors, filters
├── app.module.ts                    # Root module — imports all feature modules
├── database/
│   ├── database.module.ts           # @Global() — exports DatabaseService
│   └── database.service.ts          # Oracle connection pool (poolMin:2, poolMax:10)
├── common/
│   ├── dto/pagination.dto.ts        # PaginationDto (page, limit)
│   ├── filters/oracle-exception.filter.ts   # Maps Oracle errorNums to HTTP codes
│   └── interceptors/response.interceptor.ts # Wraps all responses in { success, data, total? }
├── stores/       (controller, service, module, dto/)
├── customers/    (controller, service, module, dto/)
├── products/     (controller, service, module, dto/)
├── inventory/    (controller, service, module, dto/)
├── sales/        (controller, service, module, dto/)
├── analytics/    (controller, service, module)
└── audit/        (controller, service, module)
```

---

## Global Middleware

### Response Interceptor (`ResponseInterceptor`)
All successful responses are wrapped:
```json
{ "success": true, "data": <result>, "total": <optional> }
```
Services that return `{ data, total }` get both fields passed through.

### Oracle Exception Filter (`OracleExceptionFilter`)
Maps Oracle error numbers to HTTP status codes:

| Oracle `errorNum` | HTTP Status | Error Code          |
|-------------------|-------------|---------------------|
| 20001             | 400         | `INSUFFICIENT_STOCK`|
| 20002             | 404         | `NOT_FOUND`         |
| 20003             | 400         | `INVALID_QUANTITY`  |
| Other DB errors   | 500         | `DB_ERROR`          |

Error response shape:
```json
{ "success": false, "message": "...", "code": "...", "statusCode": 400 }
```

### Validation Pipe
- `whitelist: true` — strips unknown properties
- `transform: true` — auto-transforms types
- `forbidNonWhitelisted: false`

---

## Database Service

`DatabaseService` (global, injected everywhere):
- Creates an Oracle connection pool on module init
- `execute<T>(sql, binds, opts)` — gets connection, runs query with `autoCommit: true`, closes connection
- Output format: `oracledb.OUT_FORMAT_OBJECT` (rows are objects, column names are UPPERCASE)

---

## Oracle Database Objects Referenced

### Tables
| Table              | Columns (inferred from SQL)                                                        |
|--------------------|------------------------------------------------------------------------------------|
| `stores`           | `store_id` (PK, auto), `store_name`, `location`                                   |
| `customers`        | `customer_id` (PK, auto), `customer_name`, `email`, `phone`, `city`               |
| `products`         | `product_id` (PK, auto), `product_name`, `category`, `price`                      |
| `inventory`        | `inventory_id` (PK, auto), `store_id` (FK), `product_id` (FK), `quantity`         |
| `sales`            | `sale_id` (PK), `store_id` (FK), `product_id`, `customer_id`, `sale_date`, `total_amt` |
| `sales_details`    | `sale_id` (FK), + detail columns                                                  |
| `inventory_audit`  | `store_id`, `changed_at`, + audit columns                                         |

### Views
| View                              | Purpose                               |
|-----------------------------------|---------------------------------------|
| `vw_best_selling_products`        | Products ranked by sales (`sales_rank` column) |
| `vw_store_sales_summary`          | Revenue & transaction summary per store |
| `vw_monthly_sales`                | Sales aggregated by month             |
| `vw_union_active_products`        | Products that are either sold or in stock (UNION) |
| `vw_intersect_sold_and_stocked`   | Products that are both sold AND in stock (INTERSECT) |
| `vw_minus_unsold_products`        | Products in stock but never sold (MINUS) |

### Materialized View
| MV                     | Purpose                               | Refresh     |
|------------------------|---------------------------------------|-------------|
| `mv_inventory_status`  | Inventory with `stock_status` column (LOW STOCK / OUT OF STOCK / etc.) | Manual via `DBMS_MVIEW.REFRESH('MV_INVENTORY_STATUS', 'C')` |

### Stored Procedure
| Procedure       | Parameters                                           | Notes |
|-----------------|------------------------------------------------------|-------|
| `process_sale`  | `store_id`, `product_id`, `quantity`, `customer_id`  | Handles sale processing; raises 20001/20002/20003 on errors |

---

## DTOs (Data Transfer Objects)

### `CreateStoreDto`
```typescript
{ store_name: string (required), location: string (required) }
```

### `UpdateStoreDto`
Extends `PartialType(CreateStoreDto)` — all fields optional.

### `CreateCustomerDto`
```typescript
{ customer_name: string (required), email?: string, phone?: string, city?: string }
```

### `UpdateCustomerDto`
Extends `PartialType(CreateCustomerDto)` — all fields optional.

### `CreateProductDto`
```typescript
{ product_name: string (required), category?: string, price: number (min: 0, required) }
```

### `UpdateProductDto`
Extends `PartialType(CreateProductDto)` — all fields optional.

### `CreateInventoryDto`
```typescript
{ store_id: number (min: 1), product_id: number (min: 1), quantity: number (min: 0) }
```

### `UpdateInventoryDto`
Extends `PartialType(CreateInventoryDto)` — all fields optional.

### `ProcessSaleDto`
```typescript
{ store_id: number (min: 1), product_id: number (min: 1), quantity: number (min: 1), customer_id?: number }
```

### `PaginationDto`
```typescript
{ page?: number (default: 1, min: 1), limit?: number (default: 20, min: 1, max: 100) }
```

---

## API Endpoints

### 1. Stores — `@Controller('stores')` → `/api/stores`

| Method   | Path              | Handler        | Service Method | Query/Body         | Description          |
|----------|-------------------|----------------|----------------|--------------------|----------------------|
| `POST`   | `/api/stores`     | `create()`     | `create()`     | Body: `CreateStoreDto` | Create store. Returns created store with `store_id` |
| `GET`    | `/api/stores`     | `findAll()`    | `findAll()`    | —                  | List all stores (no pagination) |
| `GET`    | `/api/stores/:id` | `findOne()`    | `findOne()`    | Param: `id`        | Get single store |
| `PUT`    | `/api/stores/:id` | `update()`     | `update()`     | Param: `id`, Body: `UpdateStoreDto` | Update store |
| `DELETE` | `/api/stores/:id` | `remove()`     | `remove()`     | Param: `id`        | Delete store |

**SQL used:** Direct queries on `stores` table.

---

### 2. Customers — `@Controller('customers')` → `/api/customers`

| Method   | Path                  | Handler        | Service Method | Query/Body         | Description          |
|----------|-----------------------|----------------|----------------|--------------------|----------------------|
| `POST`   | `/api/customers`      | `create()`     | `create()`     | Body: `CreateCustomerDto` | Create customer |
| `GET`    | `/api/customers`      | `findAll()`    | `findAll()`    | Query: `PaginationDto` | List customers (paginated, ROWNUM) |
| `GET`    | `/api/customers/:id`  | `findOne()`    | `findOne()`    | Param: `id`        | Get single customer |
| `PUT`    | `/api/customers/:id`  | `update()`     | `update()`     | Param: `id`, Body: `UpdateCustomerDto` | Update customer |
| `DELETE` | `/api/customers/:id`  | `remove()`     | `remove()`     | Param: `id`        | Delete customer |

**SQL used:** Direct queries on `customers` table. Pagination via ROWNUM subquery.

---

### 3. Products — `@Controller('products')` → `/api/products`

| Method   | Path                          | Handler             | Service Method       | Query/Body         | Description          |
|----------|-------------------------------|----------------------|----------------------|--------------------|----------------------|
| `POST`   | `/api/products`               | `create()`           | `create()`           | Body: `CreateProductDto` | Create product |
| `GET`    | `/api/products`               | `findAll()`          | `findAll(category?)` | Query: `category?` | List products, optionally filtered by category |
| `GET`    | `/api/products/category/:cat` | `findByCategory()`   | `findByCategory()`   | Param: `cat`       | Get products by category |
| `GET`    | `/api/products/:id`           | `findOne()`          | `findOne()`          | Param: `id`        | Get single product |
| `PUT`    | `/api/products/:id`           | `update()`           | `update()`           | Param: `id`, Body: `UpdateProductDto` | Update product |
| `DELETE` | `/api/products/:id`           | `remove()`           | `remove()`           | Param: `id`        | Delete product |

**SQL used:** Direct queries on `products` table.

---

### 4. Inventory — `@Controller('inventory')` → `/api/inventory`

| Method   | Path                           | Handler             | Service Method              | Query/Body         | Description          |
|----------|--------------------------------|----------------------|-----------------------------|--------------------|----------------------|
| `POST`   | `/api/inventory`               | `create()`           | `create()`                  | Body: `CreateInventoryDto` | Add inventory record |
| `GET`    | `/api/inventory`               | `findAll()`          | `findAll()`                 | —                  | List all inventory (from `mv_inventory_status`) |
| `GET`    | `/api/inventory/status`        | `getStatusCount()`   | `getStatusCount()`          | —                  | Count by `stock_status` |
| `GET`    | `/api/inventory/store/:storeId`| `findByStore()`      | `findByStore()`             | Param: `storeId`   | Inventory for a store |
| `PUT`    | `/api/inventory/:id`           | `update()`           | `update()`                  | Param: `id`, Body: `UpdateInventoryDto` | Update inventory |
| `POST`   | `/api/inventory/refresh-mv`    | `refreshMv()`        | `refreshMaterializedView()` | —                  | Refresh `mv_inventory_status` |

**SQL used:** INSERTs/UPDATEs on `inventory` table. Reads from `mv_inventory_status`. Refresh via `DBMS_MVIEW.REFRESH`.

---

### 5. Sales — `@Controller('sales')` → `/api/sales`

| Method   | Path                              | Handler             | Service Method       | Query/Body         | Description          |
|----------|-----------------------------------|----------------------|----------------------|--------------------|----------------------|
| `POST`   | `/api/sales/process`              | `processSale()`      | `processSale()`      | Body: `ProcessSaleDto` | Process sale via stored procedure |
| `GET`    | `/api/sales`                      | `findAll()`          | `findAll()`          | Query: `PaginationDto`, `from?`, `to?` | List sales (paginated, date-filtered) |
| `GET`    | `/api/sales/store/:storeId`       | `findByStore()`      | `findByStore()`      | Param: `storeId`   | Sales by store |
| `GET`    | `/api/sales/customer/:customerId` | `findByCustomer()`   | `findByCustomer()`   | Param: `customerId`| Sales by customer |
| `GET`    | `/api/sales/:id`                  | `findOne()`          | `findOne()`          | Param: `id`        | Get sale + details |

**SQL used:** Process via `BEGIN process_sale(...); END;`. Reads from `sales` and `sales_details` tables. Pagination via ROWNUM. Date filtering via `TO_DATE`.

---

### 6. Analytics — `@Controller('analytics')` → `/api/analytics`

| Method | Path                             | Handler              | Service Method         | Description          |
|--------|----------------------------------|----------------------|------------------------|----------------------|
| `GET`  | `/api/analytics/dashboard`       | `getDashboard()`     | `getDashboard()`       | Summary: revenue, transactions, low/out-of-stock counts, top product |
| `GET`  | `/api/analytics/store-summary`   | `getStoreSummary()`  | `getStoreSummary()`    | From `vw_store_sales_summary` |
| `GET`  | `/api/analytics/best-selling`    | `getBestSelling()`   | `getBestSelling()`     | From `vw_best_selling_products` |
| `GET`  | `/api/analytics/monthly-sales`   | `getMonthlySales()`  | `getMonthlySales()`    | From `vw_monthly_sales` |
| `GET`  | `/api/analytics/active-products` | `getActiveProducts()`| `getActiveProducts()`  | From `vw_union_active_products` |
| `GET`  | `/api/analytics/sold-and-stocked`| `getSoldAndStocked()`| `getSoldAndStocked()`  | From `vw_intersect_sold_and_stocked` |
| `GET`  | `/api/analytics/unsold-products` | `getUnsoldProducts()`| `getUnsoldProducts()`  | From `vw_minus_unsold_products` |

**SQL used:** Reads from views + direct aggregation on `sales` and `mv_inventory_status`.

---

### 7. Audit — `@Controller('audit')` → `/api/audit`

| Method | Path                        | Handler          | Service Method    | Query/Body         | Description          |
|--------|-----------------------------|------------------|-------------------|--------------------|----------------------|
| `GET`  | `/api/audit`                | `findAll()`      | `findAll()`       | Query: `PaginationDto` | List audit logs (paginated) |
| `GET`  | `/api/audit/store/:storeId` | `findByStore()`  | `findByStore()`   | Param: `storeId`, Query: `PaginationDto` | Audit logs for a store |

**SQL used:** Reads from `inventory_audit` table. Pagination via ROWNUM.

---

## Patterns Used Across the Codebase

### Adding a new endpoint (pattern to follow)

1. **DTO** — Create in `src/<module>/dto/`. Use `class-validator` decorators (`@IsString`, `@IsNumber`, `@IsOptional`, etc.)
2. **Service** — Add method in `src/<module>/<module>.service.ts`. Use `this.db.execute(sql, binds)` with Oracle bind variables (`:name` syntax)
3. **Controller** — Add route handler in `src/<module>/<module>.controller.ts`. Use NestJS decorators (`@Get`, `@Post`, `@Body`, `@Param`, `@Query`).
4. **If new module** — Create module file, register in `app.module.ts`.

### Oracle bind variable patterns
```typescript
// Positional binds (array)
this.db.execute(`SELECT * FROM table WHERE id = :id`, [id]);

// Named binds (object)
this.db.execute(`SELECT * FROM table WHERE col = :name`, { name: value });

// OUT binds for RETURNING INTO
this.db.execute(sql, {
  out_id: { type: require('oracledb').NUMBER, dir: require('oracledb').BIND_OUT },
});

// PL/SQL procedure call
this.db.execute(`BEGIN procedure_name(:p1, :p2); END;`, { p1: val1, p2: val2 });
```

### Pagination pattern (ROWNUM-based)
```sql
SELECT * FROM (
  SELECT t.*, ROWNUM rn FROM (
    SELECT * FROM <table> ORDER BY <col> DESC
  ) t WHERE ROWNUM <= :end_row
) WHERE rn > :start_row
```

---

## Environment Variables

| Variable                    | Example                        |
|-----------------------------|--------------------------------|
| `ORACLE_USER`               | `mustafa`                      |
| `ORACLE_PASSWORD`           | `Mustafa#1`                    |
| `ORACLE_CONNECTION_STRING`  | `localhost:1521/XEPDB1`        |
| `PORT`                      | `5000`                         |
| `FRONTEND_URL`              | `http://localhost:3002`        |
