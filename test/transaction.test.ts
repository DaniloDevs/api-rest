import supertest from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../src";
import { execSync } from "node:child_process";

describe('Transaction Routes', () => {
     beforeAll(async () => {
          await app.ready()
     })

     afterAll(async () => {
          await app.close()
     })

     beforeEach(() => {
          execSync('npm run knex migrate:rollback --all')
          execSync('npm run knex migrate:latest')
     })

     it('Should be able to create a new transaction', async () => {
          await supertest(app.server)
               .post('/transactions')
               .send({
                    title: "Urubu do Pix",
                    amount: 5000,
                    type: 'credit'
               })
               .expect(201)

     })

     it('Should be able to list all transaction', async () => {
          const createTransactionResponse = await supertest(app.server)
               .post('/transactions')
               .send({
                    title: "Urubu do Pix",
                    amount: 5000,
                    type: 'credit'
               })

          const cookies = createTransactionResponse.get('Set-Cookie') as string[]

          const listTransactionResponse = await supertest(app.server)
               .get('/transactions')
               .set('Cookie', cookies)
               .expect(200)

          expect(listTransactionResponse.body.transactions).toEqual([
               expect.objectContaining({
                    title: "Urubu do Pix",
                    amount: 5000,
               })
          ])
     })

     it('Should be able to get a especific transaction', async () => {
          const createTransactionResponse = await supertest(app.server)
               .post('/transactions')
               .send({
                    title: "Urubu do Pix",
                    amount: 5000,
                    type: 'credit'
               })

          const cookies = createTransactionResponse.get('Set-Cookie') as string[]

          const listTransactionResponse = await supertest(app.server)
               .get('/transactions')
               .set('Cookie', cookies)

          const transactinId = listTransactionResponse.body.transactions[0].id


          const getTransactionResponse = await supertest(app.server)
               .get(`/transactions/${transactinId}`)
               .set('Cookie', cookies)
               .expect(200)


          expect(getTransactionResponse.body.transaction).toEqual(
               expect.objectContaining({
                    title: "Urubu do Pix",
                    amount: 5000,
               })
          )
     })

     it('Should be able to get the summary', async () => {
          const createTransactionResponse = await supertest(app.server)
               .post('/transactions')
               .send({
                    title: "Urubu do Pix",
                    amount: 5000,
                    type: 'credit'
               })

          const cookies = createTransactionResponse.get('Set-Cookie') as string[]

          await supertest(app.server)
          .post('/transactions')
          .set('Cookie', cookies)
          .send({
               title: "Passaro do Pix",
               amount: 2000,
               type: 'debit'
          })

          const summaryResponse = await supertest(app.server)
               .get('/transactions/summary')
               .set('Cookie', cookies)
               .expect(200)

          expect(summaryResponse.body.summary).toEqual({
               amount: 3000
          })
     })
})