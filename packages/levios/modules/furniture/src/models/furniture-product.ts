import { model } from "@medusajs/framework/utils"
import { Fabric } from "./fabric"
import { Dimension } from "./dimension"

/**
 * Furniture product configuration model
 * Links a product to its furniture-specific settings
 */
export const FurnitureProduct = model.define("levios_furniture_product", {
  id: model.id().primaryKey(),
  product_id: model.text().unique(),
  base_price: model.bigNumber(),
  fabric_surface_area: model.float(),
  production_base_days: model.number().default(14),
  production_customization_days: model.number().default(3),
  express_available: model.boolean().default(true),
  express_days: model.number().nullable(),
  express_surcharge_percent: model.float().nullable(),
  currency_code: model.text().default("USD"),
  fabrics: model.manyToMany(() => Fabric, {
    mappedBy: "furniture_products",
    pivotTable: "levios_furniture_product_fabric",
  }),
  dimensions: model.manyToMany(() => Dimension, {
    mappedBy: "furniture_products",
    pivotTable: "levios_furniture_product_dimension",
  }),
})

export default FurnitureProduct
