import { model } from "@medusajs/framework/utils"

export const StoreConfig = model.define("levios_store_config", {
  id: model.id().primaryKey(),
  tenant_id: model.text().index("IDX_store_config_tenant"),
  store_name: model.text(),
  store_slug: model.text().unique(),
  region_id: model.text().nullable(),
  currency_code: model.text().default("TRY"),
  modules_enabled: model.json().default([]),
  providers_enabled: model.json().default([]),
  metadata: model.json().nullable(),
})

export default StoreConfig
