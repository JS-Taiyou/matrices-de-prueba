import { Elysia, t } from 'elysia'
import html, { Html } from '@elysiajs/html'
import { Layout } from '../Layout'
import { readFileSync } from 'fs'
import { join } from 'path'

export const revision = new Elysia()
    .use(html())
    .get('/revision', ({ html }) => html(
        Layout({
            children: null,
            loadedPage: 'revision'
        })
    ))
    .get('/revision-content', ({ html }) => {
        const content = readFileSync(join(process.cwd(), 'src/content/revision-content.html'), 'utf8')
        return html(content)
    })
