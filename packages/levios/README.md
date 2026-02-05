# Levios Platform

Multi-tenant commerce platform built on Medusa.

## Structure

```
packages/levios/
  apps/
    tenant-template/   # Base store template
    tenant-admin/      # Tenant admin customizations
    master-admin/      # Master admin app
  core/
  modules/
    tenancy/           # Tenant/store/commission models
  regions/
  cli/
```

## Multi-Tenant Model

- One tenant = one store database (Postgres).
- Master admin provisions tenants and manages commissions.
- Tenant admins manage catalog, pricing, and WhatsApp sales.

## Domains

- `admin.levios.co` -> master admin
- `tenant-key.admin.levios.co` -> tenant admin (or tenant switch inside master)

## Defaults

- Default region: Turkey
- Default currency: TRY
- Seed + scripts ensure TR region and TRY prices.
