import { it, beforeAll, afterAll, beforeEach, expect } from 'vitest'
import { execSync } from 'node:child_process'
import supertest from 'supertest'

import { app } from '../src/app'

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

it('should be able to create transaction', async () => {
  await supertest(app.server)
    .post('/transactions')
    .send({
      title: 'New transaction',
      amount: 1000,
      type: 'credit',
    })
    .expect(201)
})

it('should be able to list all transactions', async () => {
  const createTransactionResponse = await supertest(app.server)
    .post('/transactions')
    .send({
      title: 'New transaction',
      amount: 1000,
      type: 'credit',
    })

  const cookies = createTransactionResponse.get('Set-Cookie')

  const listTransactionResponse = await supertest(app.server)
    .get('/transactions')
    .set('Cookie', cookies)
    .expect(200)

  expect(listTransactionResponse.body.transactions).toEqual([
    expect.objectContaining({
      title: 'New transaction',
      amount: 1000,
    }),
  ])
})

it('should be able to get a specific transaction', async () => {
  const createTransactionResponse = await supertest(app.server)
    .post('/transactions')
    .send({
      title: 'New transaction',
      amount: 1000,
      type: 'credit',
    })

  const cookies = createTransactionResponse.get('Set-Cookie')

  const listTransactionResponse = await supertest(app.server)
    .get('/transactions')
    .set('Cookie', cookies)

  const transactionId = listTransactionResponse.body.transactions[0].id

  const getTransactionResponse = await supertest(app.server)
    .get(`/transactions/${transactionId}`)
    .set('Cookie', cookies)

  expect(getTransactionResponse.body.transaction).toEqual(
    expect.objectContaining({
      title: 'New transaction',
      amount: 1000,
    }),
  )
})

it('should be able to get the summary', async () => {
  const createTransactionResponse = await supertest(app.server)
    .post('/transactions')
    .send({
      title: 'Credit transaction',
      amount: 5000,
      type: 'credit',
    })

  const cookies = createTransactionResponse.get('Set-Cookie')

  await supertest(app.server)
    .post('/transactions')
    .set('Cookie', cookies)
    .send({
      title: 'Debit transaction',
      amount: 2000,
      type: 'debit',
    })

  const summaryResponse = await supertest(app.server)
    .get('/transactions/summary')
    .set('Cookie', cookies)
    .expect(200)

  expect(summaryResponse.body.summary).toEqual({
    amount: 3000,
  })
})
