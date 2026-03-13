# PostgreSQL Migration Guide

## Changes Made

### 1. Database Driver
- **Before**: `mysql-connector-python==9.0.0`
- **After**: `psycopg2-binary==2.9.9`

### 2. Database Connection
- **Before**: `mysql.connector.connect(**DB_CONFIG)`
- **After**: `psycopg2.connect(**DB_CONFIG)`
- Added `port` parameter to DB_CONFIG (default: 5432)

### 3. Cursor Dictionary Mode
- **Before**: `cursor(dictionary=True)`
- **After**: `cursor(cursor_factory=extras.RealDictCursor)`

### 4. Connection Check
- **Before**: `connection.is_connected()`
- **After**: `if connection:` (PostgreSQL doesn't have `is_connected()` method)

### 5. SQL Syntax Updates

#### Table Creation
- Changed `INT` to `INTEGER` (PostgreSQL prefers INTEGER)
- Removed inline `INDEX` syntax - now uses separate `CREATE INDEX` statements
- Removed `ON UPDATE CURRENT_TIMESTAMP` - replaced with PostgreSQL triggers

#### Triggers for `updated_at`
Created PostgreSQL triggers to automatically update `updated_at` timestamp:
```sql
CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

#### Foreign Key Constraints
- Changed `ALTER TABLE ... ADD FOREIGN KEY` to use PostgreSQL's `DO $$` block for conditional constraint creation

### 6. Docker Compose
- **Before**: MySQL 8.0 service
- **After**: PostgreSQL 15-alpine service
- Updated environment variables:
  - `DB_HOST=postgres` (was `mysql`)
  - `DB_USER=postgres` (was `root`)
  - `DB_PASSWORD=postgrespassword` (was `rootpassword`)
  - Added `DB_PORT=5432`
- Updated healthcheck to use `pg_isready`
- Changed volume from `mysql_data` to `postgres_data`

## Migration Steps

### 1. Stop Current Services
```bash
docker-compose down
```

### 2. Backup MySQL Data (if needed)
```bash
docker exec recruitments-mysql mysqldump -u root -prootpassword recruitments_db > backup.sql
```

### 3. Remove Old MySQL Volume (optional)
```bash
docker volume rm recruitments_mysql_data
```

### 4. Start PostgreSQL Services
```bash
docker-compose up -d postgres
```

### 5. Wait for PostgreSQL to be Ready
```bash
docker-compose ps
```

### 6. Start Backend (will auto-create tables)
```bash
docker-compose up -d backend
```

### 7. Import Data (if you have backup)
If you need to migrate data from MySQL, you'll need to:
1. Export MySQL data to CSV or SQL format
2. Convert SQL syntax to PostgreSQL format
3. Import into PostgreSQL

## Important Notes

1. **Data Migration**: The current migration only changes the database structure. If you have existing data in MySQL, you'll need to export and convert it separately.

2. **Port Change**: PostgreSQL uses port 5432 (instead of MySQL's 3306)

3. **Connection String**: Update any external tools or scripts that connect to the database

4. **Environment Variables**: Make sure to update `.env` file if you're using one:
   ```
   DB_HOST=postgres
   DB_USER=postgres
   DB_PASSWORD=postgrespassword
   DB_NAME=recruitments_db
   DB_PORT=5432
   ```

## Testing

After migration, test the following:
1. Database connection
2. Table creation
3. CRUD operations (Create, Read, Update, Delete)
4. Foreign key constraints
5. Triggers (updated_at auto-update)

## Rollback

If you need to rollback to MySQL:
1. Revert changes in `app.py`, `requirements.txt`, and `docker-compose.yml`
2. Restore MySQL volume or import backup
3. Restart services

