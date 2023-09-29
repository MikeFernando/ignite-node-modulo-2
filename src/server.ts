import fastify from 'fastify'

import { knex } from './database'
import { env } from './env'

const app = fastify()

app.get('/hello', async () => {
  const transaction = await knex('transactions')
    .where('amount', 1000)
    .select('*')

  return transaction
})

app.listen({ port: env.PORT }, () => {
  console.log('💻 HTTP SERVER RUNNING')
})
