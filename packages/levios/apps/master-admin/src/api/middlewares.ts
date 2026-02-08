import { defineMiddlewares } from "@medusajs/framework/http"
import { authenticate } from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    {
      matcher: /^\\/admin\\/(tenants|stores|commission-rules)(\\/.*)?$/,
      middlewares: [authenticate("user", ["session", "bearer", "api-key"])],
    },
  ],
})
