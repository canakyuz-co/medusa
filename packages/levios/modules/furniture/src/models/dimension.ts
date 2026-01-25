import { model } from "@medusajs/framework/utils"

/**
 * Dimension option model for furniture products
 */
export const Dimension = model.define("levios_dimension", {
  id: model.id().primaryKey(),
  name: model.text(),
  width: model.float(),
  depth: model.float(),
  height: model.float(),
  unit: model.enum(["cm", "in"]).default("cm"),
  price_multiplier: model.float().default(1),
  is_default: model.boolean().default(false),
})

export default Dimension
