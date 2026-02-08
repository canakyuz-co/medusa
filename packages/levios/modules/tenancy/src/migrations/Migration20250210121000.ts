import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20250210121000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table if exists "levios_store_config" add column if not exists "whatsapp_number" text null;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table if exists "levios_store_config" drop column if exists "whatsapp_number";`
    )
  }
}
