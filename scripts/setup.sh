#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is not set. Add it to your .env.local before running this script."
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql is not installed or not in PATH. Please install PostgreSQL client tools."
  exit 1
fi

echo "Running database setup using scripts/setup-database.sql..."
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/setup-database.sql
echo "Database setup completed."

#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is not set. Add it to your .env.local before running this script."
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql is not installed or not in PATH. Please install PostgreSQL client tools."
  exit 1
fi

echo "Running database setup using scripts/setup-database.sql..."
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/setup-database.sql
echo "Database setup completed."

