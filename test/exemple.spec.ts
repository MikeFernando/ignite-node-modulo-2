import { it, beforeAll, afterAll, beforeEach } from 'vitest'
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
