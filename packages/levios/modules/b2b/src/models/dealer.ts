import { model } from "@medusajs/framework/utils"

/**
 * Dealer model for B2B customers
 */
export const Dealer = model.define("levios_dealer", {
  id: model.id().primaryKey(),
  customer_id: model.text().unique(),
  company_name: model.text(),
  tax_id: model.text(),
  status: model.enum(["pending", "approved", "suspended", "rejected"]).default("pending"),
  tier: model.enum(["bronze", "silver", "gold", "platinum"]).default("bronze"),
  credit_limit: model.bigNumber().default(0),
  current_balance: model.bigNumber().default(0),
  discount_percentage: model.float().default(0),
  contact_email: model.text(),
  contact_phone: model.text().nullable(),
  billing_address: model.json().nullable(),
  approved_at: model.dateTime().nullable(),
  rejection_reason: model.text().nullable(),
  suspension_reason: model.text().nullable(),
  metadata: model.json().nullable(),
})

export default Dealer
