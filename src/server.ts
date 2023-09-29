import fastify from 'fastify'

import { knex } from './database'

const app = fastify()

app.get('/hello', async () => {
  const transaction = await knex('transactions')
    .where('amount', 1000)
    .select('*')

  return transaction
})

app.listen({ port: 3333 }, () => {
  console.log('💻 HTTP SERVER RUNNING')
})
