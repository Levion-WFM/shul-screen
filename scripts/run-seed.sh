#!/bin/bash
# Load .env.local and run the xlsx seeder.
set -e
cd "$(dirname "$0")/.."
set -a
. ./.env.local
set +a
node scripts/seed-xlsx-zmanim.js "${1:-C:/Users/theza/Downloads/standard.xlsx}"
