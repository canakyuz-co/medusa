import { model } from "@medusajs/framework/utils"

export const CommissionRule = model.define("levios_commission_rule", {
  id: model.id().primaryKey(),
  tenant_id: model.text().index("IDX_commission_rule_tenant"),
  type: model.enum(["percentage", "fixed"]).default("percentage"),
  value: model.float(),
  applies_to: model.enum(["order", "payment", "refund"]).default("order"),
  metadata: model.json().nullable(),
})

export default CommissionRule
