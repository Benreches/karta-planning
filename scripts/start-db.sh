#!/bin/bash
# Start PostgreSQL if not running, then run the dev server
if ! pg_isready -q; then
  echo "Starting PostgreSQL..."
  sudo service postgresql start
  sleep 2
fi

# Ensure DB and schema are in sync
DATABASE_URL="postgresql://karta:karta123@localhost:5432/karta_planning" \
  npx prisma@5 db push --skip-generate --accept-data-loss 2>/dev/null || true

npm run dev
