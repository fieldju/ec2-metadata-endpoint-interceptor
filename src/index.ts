import express from 'express'
import { info } from './utils'

const app = express()
const port = 3000

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => info(`Example app listening at http://localhost:${port}`))
