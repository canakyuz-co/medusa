#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${TENANT_KEY:-}" || -z "${TARGET_DIR:-}" || -z "${DATABASE_URL:-}" ]]; then
  echo "Usage: TENANT_KEY=tenant1 TARGET_DIR=/path/to/app DATABASE_URL=... ./provision-tenant.sh"
  exit 1
fi

echo "Provisioning tenant: ${TENANT_KEY}"
echo "Target directory: ${TARGET_DIR}"

# 1) Copy template into target dir
# rsync -a --exclude node_modules --exclude .env . "${TARGET_DIR}/"

# 2) Write .env for the tenant
# cat > "${TARGET_DIR}/.env" <<EOF
# DATABASE_URL=${DATABASE_URL}
# STORE_CORS=...
# ADMIN_CORS=...
# AUTH_CORS=...
# JWT_SECRET=...
# COOKIE_SECRET=...
# EOF

# 3) Install dependencies, run migrations, seed data
# (cd "${TARGET_DIR}" && yarn install)
# (cd "${TARGET_DIR}" && yarn medusa migrations run)
# (cd "${TARGET_DIR}" && yarn seed)

# 4) Run Levios scripts for TRY/TR defaults
# (cd "${TARGET_DIR}" && yarn medusa exec ./src/scripts/setup-tr.ts)
# (cd "${TARGET_DIR}" && TRY_RATE=30 yarn medusa exec ./src/scripts/add-try-prices.ts)

# 5) Create admin invite token
# (cd "${TARGET_DIR}" && yarn medusa user -e admin@${TENANT_KEY}.local --invite)

echo "Done (script is a stub; uncomment steps as needed)."
