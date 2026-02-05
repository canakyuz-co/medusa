# Levios Master Admin

Master admin application for provisioning tenants and stores.

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
