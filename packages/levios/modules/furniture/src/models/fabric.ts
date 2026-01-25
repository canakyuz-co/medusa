import { model } from "@medusajs/framework/utils"

/**
 * Fabric model for furniture products
 */
export const Fabric = model.define("levios_fabric", {
  id: model.id().primaryKey(),
  name: model.text(),
  code: model.text().unique(),
  grade: model.enum(["economy", "standard", "premium", "luxury"]),
  price_per_square_meter: model.bigNumber(),
  color_options: model.json().default([]),
  composition: model.text().nullable(),
  care_instructions: model.text().nullable(),
  image_url: model.text().nullable(),
  metadata: model.json().nullable(),
})

export default Fabric
