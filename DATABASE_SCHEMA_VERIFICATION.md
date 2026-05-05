# Oracle Database Schema Verification Report

## ✅ SCHEMA CORRECTNESS: VERIFIED

All tables, views, triggers, stored procedures, and materialized views from your schema are correctly referenced in the backend code.

---

## 🔴 CRITICAL ISSUES FOUND

### Issue 1: Field Name Case Mismatch (UPPERCASE vs lowercase)

**Problem**: Oracle returns uppercase column names (e.g., `STORE_NAME`, `PRODUCT_NAME`), but frontend expects lowercase.

**Database Column Names** → **Frontend Expects**:
- `STORE_NAME` → `name` ❌
- `PRODUCT_NAME` → `name` ❌  
- `CUSTOMER_NAME` → `name` ❌
- `TOTAL_AMT` → `total_amount` ❌

**Affected Frontend Files**:
- [src/pages/Stores.tsx](src/pages/Stores.tsx) Line 70: `row.name`
- [src/pages/Products.tsx](src/pages/Products.tsx) Line 99: `row.name`
- [src/pages/Dashboard.tsx](src/pages/Dashboard.tsx) Line 48: `row.total_amount`
- [src/pages/Dashboard.tsx](src/pages/Dashboard.tsx) Line 46: `row.store?.name`
- [src/pages/Dashboard.tsx](src/pages/Dashboard.tsx) Line 47: `row.customer?.name`

**Fix Required**: Backend must transform Oracle's uppercase response to lowercase

---

### Issue 2: Missing Data Joins for Sales Display

**Problem**: Frontend expects nested objects (`store.name`, `customer.name`) but backend queries don't perform proper JOINs.

**Current Query**:
```sql
SELECT * FROM sales WHERE store_id = :storeId
```

**Expected by Frontend** (from Dashboard.tsx Line 46-47):
```
row.store?.name      -- Store name (nested object)
row.customer?.name   -- Customer name (nested object)
```

**Backend File**: [backend/src/sales/sales.service.ts](backend/src/sales/sales.service.ts)

---

### Issue 3: Column Name Mismatches in Views

**Analytics View Column Names**:

Frontend expects → Database returns:
- `avg_sale` → `AVG_SALE_VALUE` (from `vw_store_sales_summary`)
- `total_units_sold` → `TOTAL_UNITS_SOLD` (from `vw_best_selling_products`)
- `month` → `SALE_MONTH` (from `vw_monthly_sales`)

**Affected Frontend**: [src/pages/Analytics.tsx](src/pages/Analytics.tsx) Lines 31-54

---

### Issue 4: Inventory Status Field

**Database Field**: `stock_status` (from `mv_inventory_status`)
**Frontend Field** (Line 92): `row.status`

The materialized view returns `STOCK_STATUS` but frontend expects `status` field.

---

### Issue 5: Stores Table Column Names

**Database Schema**:
```sql
CREATE TABLE stores (
  store_id    NUMBER,
  store_name  VARCHAR2(100),  -- ← Database has this
  location    VARCHAR2(200)
);
```

**Frontend expects**: `name` (not `store_name`)
**Backend returns**: `STORE_NAME` (uppercase)

---

## 📋 COMPLETE FIELD MAPPING

### Stores Table
| Database Column | Oracle Returns | Frontend Expects | Status |
|---|---|---|---|
| store_id | STORE_ID | store_id | ✅ |
| store_name | STORE_NAME | name | ❌ MISMATCH |
| location | LOCATION | location | ✅ |

### Products Table
| Database Column | Oracle Returns | Frontend Expects | Status |
|---|---|---|---|
| product_id | PRODUCT_ID | product_id | ✅ |
| product_name | PRODUCT_NAME | name | ❌ MISMATCH |
| category | CATEGORY | category | ✅ |
| price | PRICE | price | ✅ |

### Sales Table
| Database Column | Oracle Returns | Frontend Expects | Status |
|---|---|---|---|
| sale_id | SALE_ID | sale_id | ✅ |
| store_id | STORE_ID | *(nested as store.id)* | ❌ NEEDS JOIN |
| customer_id | CUSTOMER_ID | *(nested as customer.id)* | ❌ NEEDS JOIN |
| total_amt | TOTAL_AMT | total_amount | ❌ MISMATCH |
| sale_date | SALE_DATE | sale_date | ✅ |

### Inventory (from mv_inventory_status)
| Database Column | Oracle Returns | Frontend Expects | Status |
|---|---|---|---|
| store_name | STORE_NAME | store_name | ✅ |
| product_name | PRODUCT_NAME | product_name | ✅ |
| quantity | QUANTITY | quantity | ✅ |
| stock_status | STOCK_STATUS | status | ❌ MISMATCH |

### Analytics Views
| View | Database Column | Frontend Expects | Status |
|---|---|---|---|
| vw_store_sales_summary | AVG_SALE_VALUE | avg_sale | ❌ MISMATCH |
| vw_best_selling_products | TOTAL_UNITS_SOLD | total_units_sold | ✅ |
| vw_monthly_sales | SALE_MONTH | month | ❌ MISMATCH |

---

## ✅ VERIFIED COMPONENTS

### Tables
- ✅ `stores` table exists with correct structure
- ✅ `customers` table exists with correct structure
- ✅ `products` table exists with correct structure
- ✅ `inventory` table exists with correct FK references
- ✅ `sales` table exists (partitioned) with correct structure
- ✅ `sales_details` table exists with correct structure
- ✅ `inventory_audit` table exists with correct structure

### Stored Procedures
- ✅ `process_sale` procedure is called correctly in [backend/src/sales/sales.service.ts](backend/src/sales/sales.service.ts) Line 12

### Triggers
- ✅ `after_sale_update_inventory` trigger will fire on INSERT to sales_details
- ✅ `inventory_audit_trigger` trigger will fire on UPDATE/DELETE to inventory

### Views
- ✅ `vw_store_sales_summary` - Used in Analytics page
- ✅ `vw_best_selling_products` - Used in Analytics page
- ✅ `vw_monthly_sales` - Used in Analytics page
- ✅ `vw_union_active_products` - Used in Analytics page
- ✅ `vw_intersect_sold_and_stocked` - Used in Analytics page
- ✅ `vw_minus_unsold_products` - Used in Analytics page

### Materialized View
- ✅ `mv_inventory_status` - Used in Inventory page and Dashboard
- ✅ Refresh mechanism works (DBMS_MVIEW.REFRESH call in [backend/src/inventory/inventory.service.ts](backend/src/inventory/inventory.service.ts) Line 55)

---

## RECOMMENDATIONS

### Priority 1 (CRITICAL - Blocks Data Display)
1. Add response transformation layer in backend to convert Oracle uppercase column names to lowercase
2. Add JOIN queries for Sales to include store and customer data
3. Fix column name mappings (total_amt → total_amount, etc.)

### Priority 2 (HIGH - Data Incomplete)
1. Transform Analytics view column names to match frontend expectations
2. Fix inventory status field name from `stock_status` to `status`

### Priority 3 (MEDIUM - Code Quality)
1. Consider using ORM (TypeORM) to handle column name mapping automatically
2. Create response DTO classes to ensure consistent field naming
