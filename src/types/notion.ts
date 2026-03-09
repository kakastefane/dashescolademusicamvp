import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'

// Helper para extrair propriedades tipadas do Notion
export type NotionPage = PageObjectResponse

export type NotionProperty = PageObjectResponse['properties'][string]

// Helpers de extração (use em lib/notion/*.ts)
export function getTitle(page: NotionPage, field: string): string {
    const prop = page.properties[field]
    if (prop?.type === 'title') {
        return prop.title.map(t => t.plain_text).join('')
    }
    return ''
}

export function getRichText(page: NotionPage, field: string): string {
    const prop = page.properties[field]
    if (prop?.type === 'rich_text') {
        return prop.rich_text.map(t => t.plain_text).join('')
    }
    return ''
}

export function getSelect(page: NotionPage, field: string): string | null {
    const prop = page.properties[field]
    if (prop?.type === 'select') return prop.select?.name ?? null
    return null
}

export function getMultiSelect(page: NotionPage, field: string): string[] {
    const prop = page.properties[field]
    if (prop?.type === 'multi_select') return prop.multi_select.map(s => s.name)
    return []
}

export function getDate(page: NotionPage, field: string): string | null {
    const prop = page.properties[field]
    if (prop?.type === 'date') return prop.date?.start ?? null
    return null
}

export function getNumber(page: NotionPage, field: string): number | null {
    const prop = page.properties[field]
    if (prop?.type === 'number') return prop.number
    return null
}

export function getRelationIds(page: NotionPage, field: string): string[] {
    const prop = page.properties[field]
    if (prop?.type === 'relation') return prop.relation.map(r => r.id)
    return []
}

export function getPhone(page: NotionPage, field: string): string {
    const prop = page.properties[field]
    if (prop?.type === 'phone_number') return prop.phone_number ?? ''
    return ''
}

export function getEmail(page: NotionPage, field: string): string {
    const prop = page.properties[field]
    if (prop?.type === 'email') return prop.email ?? ''
    return ''
}

export function getRollupNumber(page: NotionPage, field: string): number | null {
    const prop = page.properties[field]
    if (prop?.type === 'rollup' && prop.rollup.type === 'number') {
        return prop.rollup.number
    }
    return null
}
