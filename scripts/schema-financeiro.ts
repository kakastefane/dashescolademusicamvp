import { Client } from '@notionhq/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const notion = new Client({ auth: process.env.NOTION_API_KEY })
const DB_PAGAMENTOS = process.env.NOTION_DB_PAGAMENTOS!
const DB_CONTRATOS = process.env.NOTION_DB_CONTRATOS!

async function test() {
    try {
        const dbPagamentos = await notion.databases.retrieve({ database_id: DB_PAGAMENTOS })
        console.log('--- Propriedades da DB Pagamentos ---')
        for (const [key, value] of Object.entries(dbPagamentos.properties)) {
            console.log(`- "${key}" (${value.type})`)
        }

        const dbContratos = await notion.databases.retrieve({ database_id: DB_CONTRATOS })
        console.log('\n--- Propriedades da DB Contratos ---')
        for (const [key, value] of Object.entries(dbContratos.properties)) {
            console.log(`- "${key}" (${value.type})`)
        }
    } catch (err: any) {
        console.error('ERRO DA API NOTION:', err.body || err.message || err)
    }
}

test()
