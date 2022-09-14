const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const PORT = process.env.PORT || 3333

const app = express()

app.use(express.json())
app.use(cors())

// Conectando com banco de dados
mongoose.connect(process.env.MONGO_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true
}, () => console.log('Connected to database'))

// Definindo Schemas
const UserSchema = new mongoose.Schema({ username: String })
const User = mongoose.model('User', UserSchema)

const TodoSchema = new mongoose.Schema({ description: String, done: Boolean, user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'
}})
const Todo = mongoose.model('Todo', TodoSchema)

// Logando o usuário
app.post('/session', async (req, res) => {
  const { username } = req.body
  let user = ''

  try {
    user = await User.findOne({ username })
    if(!user) {
      user = await User.create({ username })
    }
    return res.status(200).send(user)

  } catch(err) {
    return res.status(400).send(err)
  }
})

// criar to-do POST
app.post('/todo/:user_id', async (req, res) => {
  const { description, done } = req.body
  const { user_id } = req.params

  try {

    const newTodo = await Todo.create({ description, done, user: user_id })
    return res.status(200).send(newTodo)

  } catch(err) {
    return res.status(400).send(err)
  }
})

// listar to-dos GET
app.get('/todo/:user_id', async (req, res) => {
  const { user_id } = req.params

  try {

    const allTodos = await Todo.find({ user: user_id })
    return res.status(200).send(allTodos)

  } catch (err) {
    return res.status(400).send(err)
  }
})

// atualizar to-dos PATCH
app.patch('/todo/:user_id/:todo_id', async (req, res) => {
  const data = req.body
  const { todo_id, user_id } = req.params

  try {

    const belongsToUser = await Todo.findOne({ user: user_id })
    if(!belongsToUser) return res.status(400).send('Operation not allowed')

    const updatedTodo = await Todo.findByIdAndUpdate( todo_id, data, { new: true })
    return res.status(200).send(updatedTodo)

  } catch (err) {
    return res.status(400).send(err)
  }
})

// delete to-dos DELETE
app.delete('/todo/:user_id/:todo_id', async (req, res) => {
  const { todo_id, user_id } = req.params

  try {
    const belongsToUser = await Todo.findOne({ user: user_id })
    if(!belongsToUser) return res.status(400).send('Operation not allowed')

    const deletedTodo = await Todo.findByIdAndRemove(todo_id)
    return res.status(200).send({ 
      message: 'Todo deletado com sucesso',
      deletedTodo
    })

  } catch (err) {
    return res.status(400).send(err)
  }
})

// Rodando o projeto
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

