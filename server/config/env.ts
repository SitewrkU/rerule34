import dotenv from 'dotenv'

dotenv.config()

export const PORT = process.env.PORT || 3000
export const R34_API_KEY = process.env.R34_API_KEY
export const R34_USER_ID = process.env.R34_USER_ID

if(!R34_API_KEY || !R34_USER_ID){
  throw new Error('Please set R34_API_KEY and R34_USER_ID')
}