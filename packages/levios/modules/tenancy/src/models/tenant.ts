import { model } from "@medusajs/framework/utils"

export const Tenant = model.define("levios_tenant", {
  id: model.id().primaryKey(),
  name: model.text(),
  slug: model.text().unique(),
  status: model.enum(["active", "suspended"]).default("active"),
  default_region: model.text().nullable(),
  default_currency: model.text().default("TRY"),
  metadata: model.json().nullable(),
})

export default Tenant
