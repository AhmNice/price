import express from 'express'
import { getAlerts } from '../controller/alert.controller'
const alertRouter = express.Router()

alertRouter.get('/list', getAlerts)

export default alertRouter
