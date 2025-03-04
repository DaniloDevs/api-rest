import { knex as setupKenux, Knex } from "knex"
import { env } from "./env"


export const knexConfig: Knex.Config = {
     client: "sqlite",
     connection: {
          filename: env.DATABASE_URL
     },
     useNullAsDefault: true,
     migrations: {
          extension: "ts",
          directory: "./database/migrations"
     }
}

export const knex = setupKenux(knexConfig)
