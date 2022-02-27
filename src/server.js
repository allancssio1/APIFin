const express = require('express')
const { v4: uuid } = require('uuid') //instalar a biblioteca uuid

const app = express()

app.use(express.json())

const customers = []

const verifyIfExistsAccountCPF = (req, res, next) => {
  const { cpf } = req.headers

  const customer = customers.find(curtomer => curtomer.cpf === cpf)

  if(!customer) return res.status(400).json({error: "Cliente não encontrado."})

  req.customer = customer

  return next()
}

app.post('/account', (req, res) => {
  const {name, cpf} = req.body

  const customersExists =
    customers.some(
      customer => customer.cpf === cpf
    )
  
  if(customersExists) return res.status(400).json({error: 'usuário já exist'})

  customers.push({
    name,
    cpf,
    id: uuid(),
    statement: []
  })
  return res.status(201).send('criado')
})

app.get("/statement", verifyIfExistsAccountCPF, (req, res) => {
  const {customer} = req

  return res.status(200).json(customer.statement)

})

app.post("/deposit", verifyIfExistsAccountCPF, (req, res) => {
  const {customer} = req

  
})

app.listen(3333, console.log('server running'))