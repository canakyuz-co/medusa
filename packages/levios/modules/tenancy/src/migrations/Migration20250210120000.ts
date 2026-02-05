import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20250210120000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table if not exists "levios_tenant" ("id" text not null, "name" text not null, "slug" text not null, "status" text not null, "default_region" text null, "default_currency" text not null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "levios_tenant_pkey" primary key ("id"));`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_levios_tenant_deleted_at" ON "levios_tenant" ("deleted_at") WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_levios_tenant_slug_unique" ON "levios_tenant" ("slug") WHERE deleted_at IS NULL;`
    )

    this.addSql(
      `create table if not exists "levios_store_config" ("id" text not null, "tenant_id" text not null, "store_name" text not null, "store_slug" text not null, "region_id" text null, "currency_code" text not null, "modules_enabled" jsonb not null default '[]'::jsonb, "providers_enabled" jsonb not null default '[]'::jsonb, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "levios_store_config_pkey" primary key ("id"));`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_levios_store_config_deleted_at" ON "levios_store_config" ("deleted_at") WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_levios_store_config_tenant" ON "levios_store_config" ("tenant_id") WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_levios_store_config_slug_unique" ON "levios_store_config" ("store_slug") WHERE deleted_at IS NULL;`
    )

    this.addSql(
      `create table if not exists "levios_commission_rule" ("id" text not null, "tenant_id" text not null, "type" text not null, "value" double precision not null, "applies_to" text not null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "levios_commission_rule_pkey" primary key ("id"));`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_levios_commission_rule_deleted_at" ON "levios_commission_rule" ("deleted_at") WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_levios_commission_rule_tenant" ON "levios_commission_rule" ("tenant_id") WHERE deleted_at IS NULL;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "levios_commission_rule" cascade;`)
    this.addSql(`drop table if exists "levios_store_config" cascade;`)
    this.addSql(`drop table if exists "levios_tenant" cascade;`)
  }
}
