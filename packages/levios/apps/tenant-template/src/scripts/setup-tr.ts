import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import {
  createRegionsWorkflow,
  createTaxRegionsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"

export default async function setupTr({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const storeModuleService = container.resolve(Modules.STORE)
  const regionModuleService = container.resolve(Modules.REGION)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const [store] = await storeModuleService.listStores()

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        supported_currencies: [
          {
            currency_code: "try",
            is_default: true,
          },
        ],
      },
    },
  })

  const existingRegions = await regionModuleService.listRegions({
    name: "Turkey",
  })

  if (!existingRegions.length) {
    await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "Turkey",
            currency_code: "try",
            countries: ["tr"],
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    })
    logger.info("Created Turkey region with TRY currency.")
  } else {
    logger.info("Turkey region already exists. Skipping creation.")
  }

  const { data: taxRegions } = await query.graph({
    entity: "tax_region",
    fields: ["id"],
    filters: { country_code: "tr" },
  })

  if (!taxRegions?.length) {
    await createTaxRegionsWorkflow(container).run({
      input: [
        {
          country_code: "tr",
          provider_id: "tp_system",
        },
      ],
    })
    logger.info("Created TR tax region.")
  } else {
    logger.info("TR tax region already exists. Skipping creation.")
  }
}
