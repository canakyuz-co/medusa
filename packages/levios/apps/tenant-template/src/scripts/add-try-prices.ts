import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

type VariantRecord = {
  id: string
  price_set?: {
    id: string
    prices?: {
      currency_code: string
      amount: number
    }[]
  } | null
}

export default async function addTryPrices({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const pricingModule = container.resolve(Modules.PRICING)

  const exchangeRate = Number(process.env.TRY_RATE || "30")
  if (Number.isNaN(exchangeRate) || exchangeRate <= 0) {
    throw new Error("TRY_RATE must be a positive number")
  }

  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: [
      "id",
      "price_set.id",
      "price_set.prices.currency_code",
      "price_set.prices.amount",
    ],
  })

  const updatedPriceSets = new Set<string>()
  let createdCount = 0

  for (const variant of (variants || []) as VariantRecord[]) {
    const priceSet = variant.price_set
    if (!priceSet?.id || !priceSet.prices?.length) {
      continue
    }

    const hasTry = priceSet.prices.some(
      (price) => price.currency_code === "try"
    )
    if (hasTry || updatedPriceSets.has(priceSet.id)) {
      continue
    }

    const basePrice =
      priceSet.prices.find((price) => price.currency_code === "usd") ||
      priceSet.prices.find((price) => price.currency_code === "eur") ||
      priceSet.prices[0]

    if (!basePrice) {
      continue
    }

    const tryAmount = Math.round(basePrice.amount * exchangeRate)

    await pricingModule.addPrices({
      priceSetId: priceSet.id,
      prices: [
        {
          currency_code: "try",
          amount: tryAmount,
        },
      ],
    })

    updatedPriceSets.add(priceSet.id)
    createdCount += 1
  }

  logger.info(`Added TRY prices to ${createdCount} price sets.`)
}
