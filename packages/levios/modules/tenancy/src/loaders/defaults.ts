import { LoaderOptions, Logger } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async ({ container }: LoaderOptions): Promise<void> => {
  const logger =
    container.resolve<Logger>(ContainerRegistrationKeys.LOGGER) ?? console

  logger.debug("Levios Tenancy loader initialized.")
}
