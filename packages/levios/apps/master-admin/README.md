# Levios Master Admin

Master admin application for provisioning tenants and stores.

## API Draft

Located under `src/api/admin`:
- `GET /admin/tenants`, `POST /admin/tenants`
- `GET /admin/stores`, `POST /admin/stores`
- `PATCH /admin/stores/:id`
- `GET /admin/commission-rules`, `POST /admin/commission-rules`

## Config

Enable `@levios/tenancy` in `medusa-config.ts` to load tenant models.

## Auth

`src/api/middlewares.ts` protects master-admin routes with admin auth.

## Core Models (Draft)

### Tenant
- id
- name
- slug
- status (active, suspended)
- default_region
- default_currency
- commission_rate
- created_at

### StoreConfig
- id
- tenant_id
- store_name
- store_slug
- region_id
- currency_code
- modules_enabled
- providers_enabled

### CommissionRule
- id
- tenant_id
- type (percentage, fixed)
- value
- applies_to (order, payment, refund)
