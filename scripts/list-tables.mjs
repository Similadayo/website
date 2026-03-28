import { createClient } from "@libsql/client"
import dotenv from "dotenv"

dotenv.config()

const url = process.env.DATABASE_URL
const authToken = process.env.AUTH_TOKEN

const client = createClient({ url, authToken })

async function main() {
  console.log(`\n--- Production Database Tables ---`)
  const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table'")
  console.log(JSON.stringify(result.rows.map(r => r.name), null, 2))
}

main()
  .catch(console.error)
