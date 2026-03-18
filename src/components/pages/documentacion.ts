import { Elysia } from 'elysia'
import html, { Html } from '@elysiajs/html'
import { Layout } from '../Layout'
import { getFieldsWithOptions } from '../../db/queries'
import { renderFieldHtml } from '../../db/field-renderer'

export const documentacion = new Elysia()
    .use(html())
    .get('/documentacion', ({ html }) => html(
        Layout({
            children: null,
            loadedPage: 'documentacion'
        })
    ))
    .get('/documentacion-content', ({ html }) => {
        const fields = getFieldsWithOptions()
        const rootFields = fields.filter(f => f.father_field === null)
        
        // Render all root fields AND their children (for checkbox_with_input patterns)
        const fieldsHtml = rootFields.map(field => {
            // Add "Campo 63:" label before field 14
            const labelBefore = field.id === 14 ? `<div class="mt-4 mb-2"><span class="label-text text-lg font-semibold">Campo 63:</span></div>` : ''
            const fieldHtml = renderFieldHtml(field, fields)
            // Find and render child fields (inputs controlled by checkboxes)
            const childFields = fields.filter(f => f.father_field === field.id && field.type === 'checkbox_with_input')
            const childHtml = childFields.map(child => renderFieldHtml(child, fields)).join('\n')
            return labelBefore + fieldHtml + '\n' + childHtml
        }).join('\n')
        
        const content = `<div class="flex flex-row w-full" x-data="documentacionApp()">
    <div class="w-1/2 p-4">
        ${fieldsHtml}
    </div>

    <div class="w-1/2 p-4 sticky top-4 self-start h-screen">
        <div class="form-control h-full">
            <label class="label">
                <span class="label-text text-lg font-semibold">Generated Code</span>
            </label>
            <div class="mockup-code h-5/6 w-full overflow-auto">
                <pre class="text-accent-content whitespace-pre-wrap">
                    <code class="pl-4 block" x-text="processedCode"></code>
                </pre>
            </div>
        </div>
    </div>
</div>`
        
        return html(content)
    })
