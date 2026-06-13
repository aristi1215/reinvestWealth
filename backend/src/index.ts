import 'dotenv/config'
import { createApp } from './app.js'
import { env, logEnvStatus } from './config/env.js'
import { startScheduler } from './services/scheduler.js'

const app = createApp()

logEnvStatus()
startScheduler()

app.listen(env.PORT, () => {
  console.log(`[server] listening on http://localhost:${env.PORT}`)
})
