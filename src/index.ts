import fastify from "fastify"
import Cookie from "@fastify/cookie";

import TransactionsRoutes from "./routes/transaction";

export  const app = fastify()

// Plugins
app.register(Cookie)

// Routes 
app.register(TransactionsRoutes, {
  prefix: "transactions"
})

