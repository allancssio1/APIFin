const express = require('express')
const { v4: uuid } = require('uuid') //instalar a biblioteca uuid

const app = express()

app.use(express.json())

const customers = []

app.post('/account', (req, res) => {
  const {name, cpf} = req.body

  const customersExists =
    customers.some(
      customer => customer.cpf === cpf
    )
  
  if(customersExists) return res.status(400).json({error: 'usuário já exist'})

  const id = uuid()

  customers.push({
    name,
    cpf,
    id: uuid(),
    statement: []
  })
  return res.status(201).send('criado')
})

app.listen(3333, console.log('server running'))