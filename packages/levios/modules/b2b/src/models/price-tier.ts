import { model } from "@medusajs/framework/utils"

/**
 * Price tier model for bulk pricing
 */
export const PriceTier = model.define("levios_price_tier", {
  id: model.id().primaryKey(),
  name: model.text(),
  min_quantity: model.number(),
  max_quantity: model.number().nullable(),
  discount_percentage: model.float(),
  is_active: model.boolean().default(true),
})

export default PriceTier
