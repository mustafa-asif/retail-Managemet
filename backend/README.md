# Save Mart Retail Management System - REST API

A complete NestJS REST API for Save Mart, connecting to an Oracle SQL*Plus database.

## Prerequisites
- Node.js v18+
- Oracle Client / Oracle DB with the existing Save Mart schema.

## Installation

1. Navigate to the backend directory:
   \`\`\`bash
   cd backend
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Configure Environment Variables:
   Rename the \`.env.example\` file to \`.env\` and add your Oracle connection credentials.
   \`\`\`bash
   cp .env.example .env
   \`\`\`

## Running the Application

\`\`\`bash
npm run start:dev
\`\`\`
The server will start on \`http://localhost:5000/api\`

## Structure
- `/api/stores`: Manage stores.
- `/api/customers`: Manage customers.
- `/api/products`: Manage products.
- `/api/inventory`: Check stock, update inventory, refresh Oracle materialized view.
- `/api/sales`: Process sales via Oracle stored procedures.
- `/api/analytics`: Get dashboards, store summary, active/inactive products from Oracle Views.
- `/api/audit`: View inventory audit logs paginated.
