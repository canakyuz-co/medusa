import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text } from "@medusajs/ui"
import { useTranslation } from "react-i18next"

const LeviosWelcomeWidget = () => {
  const { t } = useTranslation()

  return (
    <Container className="p-0">
      <div className="px-6 py-4">
        <Heading level="h2">{t("levios.title")}</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          {t("levios.description")}
        </Text>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.before",
})

export default LeviosWelcomeWidget
