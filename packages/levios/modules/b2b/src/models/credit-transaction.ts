import { model } from "@medusajs/framework/utils"
import { Dealer } from "./dealer"

/**
 * Credit transaction model for dealer credit accounts
 */
export const CreditTransaction = model.define("levios_credit_transaction", {
  id: model.id().primaryKey(),
  dealer: model.belongsTo(() => Dealer, {
    mappedBy: "credit_transactions",
  }),
  type: model.enum(["credit", "debit", "payment", "adjustment"]),
  amount: model.bigNumber(),
  balance: model.bigNumber(),
  order_id: model.text().nullable(),
  description: model.text(),
})

export default CreditTransaction
