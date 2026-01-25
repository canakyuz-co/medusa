import { model } from "@medusajs/framework/utils"
import { Dealer } from "./dealer"

/**
 * Bulk order model for B2B orders
 */
export const BulkOrder = model.define("levios_bulk_order", {
  id: model.id().primaryKey(),
  dealer: model.belongsTo(() => Dealer, {
    mappedBy: "bulk_orders",
  }),
  items: model.json().default([]),
  subtotal: model.bigNumber(),
  discount: model.bigNumber(),
  total: model.bigNumber(),
  status: model.enum(["draft", "submitted", "approved", "rejected", "completed"]).default("draft"),
  notes: model.text().nullable(),
  rejection_reason: model.text().nullable(),
})

export default BulkOrder
