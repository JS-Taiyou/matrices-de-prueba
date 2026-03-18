import { Elysia, t } from 'elysia'
import html, { Html } from '@elysiajs/html'
import { Layout } from '../Layout'
import { readFileSync } from 'fs'
import { join } from 'path'

export const queries = new Elysia()
    .use(html())
    .get('/queries', ({ html }) => html(
        Layout({
            children: null,
            loadedPage: 'queries'
        })
    ))
    .get('/queries-content', ({ html }) => {
        const content = readFileSync(join(process.cwd(), 'src/content/queries-content.html'), 'utf8')
        return html(content)
    })
