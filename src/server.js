const express = require('express')
const { v4: uuid } = require('uuid') //instalar a biblioteca uuid

const app = express()

app.use(express.json())

const customers = []

const verifyIfExistsAccountCPF = (req, res, next) => {
  const { cpf } = req.headers

  const customer = customers.find(customer => customer.cpf === cpf)

  if(!customer) return res.status(400).json({error: "Cliente não encontrado."})

  req.customer = customer

  return next()
}

const getBalace = (statement) => {
  //reduce recebe um acumulador e o pŕoximo na lista para ser o valor a ser calculado.
  const balance = statement.reduce((acumulator, operation) => {
    if (operation.type === 'credit') {
      return acumulator + operation.amount
    }else {
      return acumulator - operation.amount
    }
  }, 0)

  return balance
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
  const {description, amount} = req.body
  const {customer} = req
  const statementOperation = {
    description,
    amount,
    create_at: new Date(),
    type: 'credit'
  }

  customer.statement.push(statementOperation)

  return res
    .status(201)
    .send({
      success: true, 
      mensage: 'Depósito adicionado com sucesso!'
    })
})

app.post("/withdraw", verifyIfExistsAccountCPF, (req, res) => {
  const {amount} = req.body
  const {customer} = req
  const balance = getBalace(customer.statement)

  if(balance < amount) return res.status(400).send({
    error: 'Valor insuficiente!'
  })

  const statementOperation = {
    amount,
    create_at: new Date(),
    type: "debit"
  }

  customer.statement.push(statementOperation)

  return res.status(201). send({success: true, message: "Saque efetuado com sucesso!"})
})

app.get("/statement/date", verifyIfExistsAccountCPF, (req, res) => {
  const {customers} = req
  const {date} = req.query
  const dateFormat = new Date(date + " 00:00")

  const statement = customers.statement.filter(customer => customer.create_at.toDateString() === new Date(dateFormat).toDateString())

  if(statement.length <= 0) return res.status(400).send({success: false, message: "Extrato por data."})

  return res.status(201).send({success: true, message: "Extrato por data.", statement})
})

app.put('/account', verifyIfExistsAccountCPF, (req, res) => {
  const { name } = req.body
  const { customer } = req

  customer.name = name

  return res.status(201).send({success: true, message: "atualização de dados.", customer})
})

app.get('/account', verifyIfExistsAccountCPF, (req,res) => {
  const { customer } = req

  return res.status(201).json( customer)
})

app.delete('/account', verifyIfExistsAccountCPF, (req,res) => {
  const { customer } = req

  customers.splice(customer, 1)

  return res.status(200).json(customers)
})

app.get("/balance", verifyIfExistsAccountCPF, (req, res) => {
  const {customer} = req

  const balance = getBalace(customer.statement)

  return res.status(201).json(balance)
})

app.listen(3333, console.log('server running'))