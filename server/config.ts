import { config } from 'dotenv'
config()

export const CONFIG = {
  PORT:       Number(process.env['PORT']    ?? 4000),
  HOST:       process.env['HOST']           ?? '0.0.0.0',
  DB_PATH:    process.env['DB_PATH']        ?? './data/eta-office.db',
  UPLOADS_DIR:process.env['UPLOADS_DIR']   ?? './uploads',
  JWT_SECRET: process.env['JWT_SECRET']    ?? 'dev-secret-change-in-prod',
  JWT_EXPIRY: process.env['JWT_EXPIRY']    ?? '8h',
}
