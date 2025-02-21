import { FastifyInstance } from "fastify"
import { randomUUID } from "node:crypto"
import { z } from "zod"
import { knex } from "../database"
import { checkSessionIdExists } from "../middleware/check-session-id-exist"


export default async function TransactionsRoutes(app: FastifyInstance) {
     app.get(
          '/',
          {
               preHandler: [checkSessionIdExists]
          },
          async (request, reply) => {
               const sessionId = request.cookies.sessionId
               const transactions = await knex('transactions').where('session_id', sessionId).select()

               return reply.status(200).send({ transactions })
          }
     )

     app.get(
          '/:id',
          {
               preHandler: [checkSessionIdExists]
          },
          async (request, reply) => {
               const sessionId = request.cookies.sessionId


               const getTransactionParamsSchema = z.object({
                    id: z.string().uuid()
               })

               const { id } = getTransactionParamsSchema.parse(request.params)

               const transaction = await knex('transactions').where({
                    id,
                    session_id: sessionId
               }).first()

               return reply.status(200).send({ transaction })
          }
     )

     app.get(
          '/summary',
          {
               preHandler: [checkSessionIdExists]
          },
          async (request, reply) => {
               const sessionId = request.cookies.sessionId
               const summary = await knex('transactions').where('session_id', sessionId).sum('amount', { as: "amount" }).first()

               return reply.status(200).send({ summary })
          }
     )

     app.post(
          "/",
          async (request, reply) => {
               const createTransactionSchema = z.object({
                    title: z.string(),
                    amount: z.number(),
                    type: z.enum(["credit", "debit"])
               })


               const { title, amount, type } = createTransactionSchema.parse(request.body)

               let sessionId = request.cookies.sessionId

               if (!sessionId) {
                    sessionId = randomUUID()

                    reply.cookie('sessionId', sessionId, {
                         path: "/",
                         maxAge: 60 * 60 * 24 * 7 // 7 Days
                    })
               }

               await knex("transactions").insert({
                    id: randomUUID(),
                    title,
                    amount: type === "credit" ? amount : amount * -1,
                    session_id: sessionId
               })

               return reply.status(201).send()
          }
     )
}