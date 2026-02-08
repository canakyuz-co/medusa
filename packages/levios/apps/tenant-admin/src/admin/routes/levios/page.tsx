import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Button, Badge } from "@medusajs/ui"

const LeviosSuperAdminPage = () => {
  return (
    <div className="flex flex-col gap-y-6">
      <Container className="p-6">
        <div className="flex items-center gap-x-3">
          <Heading level="h1">Levios Super Admin</Heading>
          <Badge color="blue">Super Admin</Badge>
        </div>
        <Text className="text-ui-fg-subtle mt-2">
          Bu ekran yalnızca Levios yöneticileri içindir. Tenant, mağaza ve
          template yönetimini buradan yapacaksın.
        </Text>
      </Container>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Container className="p-6">
          <Heading level="h2">Tenant Yönetimi</Heading>
          <Text className="text-ui-fg-subtle mt-2">
            Yeni tenant oluştur, düzenle ve durumu yönet.
          </Text>
          <Button variant="secondary" className="mt-4">
            Tenantları Gör
          </Button>
        </Container>

        <Container className="p-6">
          <Heading level="h2">Mağaza Ayarları</Heading>
          <Text className="text-ui-fg-subtle mt-2">
            WhatsApp numarası ve katalog ayarlarını yönet.
          </Text>
          <Button variant="secondary" className="mt-4">
            Mağazaları Gör
          </Button>
        </Container>

        <Container className="p-6">
          <Heading level="h2">Template Seçimi</Heading>
          <Text className="text-ui-fg-subtle mt-2">
            Müşteri için şablon seçip deploy sürecini başlat.
          </Text>
          <Button variant="secondary" className="mt-4">
            Template Listesi
          </Button>
        </Container>
      </div>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Levios",
  rank: 5,
})

export default LeviosSuperAdminPage
