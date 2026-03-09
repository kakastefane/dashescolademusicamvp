import { Client } from '@notionhq/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const notion = new Client({ auth: process.env.NOTION_API_KEY })
const DB_AULAS = process.env.NOTION_DB_AULAS!

async function test() {
    try {
        const db = await notion.databases.retrieve({ database_id: DB_AULAS })
        console.log('Propriedades da DB Aulas:')
        for (const [key, value] of Object.entries(db.properties)) {
            console.log(`- "${key}" (${value.type})`)
        }
    } catch (err: any) {
        console.error('ERRO DA API NOTION:', err.body || err.message || err)
    }
}

test()
