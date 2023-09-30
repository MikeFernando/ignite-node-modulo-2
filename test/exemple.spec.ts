import { test, beforeAll, afterAll } from 'vitest'
import supertest from 'supertest'

import { app } from '../src/app'

beforeAll(async () => {
  await app.ready()
})

afterAll(async () => {
  await app.close()
})

test('User should be able to create transaction', async () => {
  await supertest(app.server)
    .post('/transactions')
    .send({
      title: 'New transaction',
      amount: 1000,
      type: 'credit',
    })
    .expect(201)
})
