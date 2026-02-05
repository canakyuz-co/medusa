# Levios Tenant Template

This is a base template for tenant stores. It contains common scripts and
configuration defaults used when provisioning new stores.

## Scripts

- `src/scripts/setup-tr.ts`: Sets default currency to TRY and ensures TR region.
- `src/scripts/add-try-prices.ts`: Adds TRY prices to variants using `TRY_RATE`.

## Environment

Copy `.env.example` to `.env` in each tenant app and fill in values.
