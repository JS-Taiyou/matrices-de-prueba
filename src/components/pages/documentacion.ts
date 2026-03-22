import { Elysia } from 'elysia'
import html from '@elysiajs/html'
import { Layout } from '../Layout'

export const documentacion = new Elysia()
    .use(html())
    .get('/documentacion', ({ html }) => html(
        Layout({
            children: null,
            loadedPage: 'documentacion'
        })
    ))
    .get('/documentacion-content', ({ html }) => {
        const content = `<div class="flex flex-row w-full" x-data="documentacionApp()">
    <div class="w-1/2 p-4">
        <!-- Contenedor de grupos -->
        <template x-for="(group, index) in inputGroups" :key="group.id">
            <div class="collapse collapse-arrow bg-base-200 mb-4" :class="{ 'collapse-open': !group.collapsed }">
                <!-- Header con label dinámico y botón eliminar -->
                <div class="collapse-title min-h-0 py-2"
                     @click="toggleCollapse(group.id)">
                    <div class="flex justify-between items-center pl-6 pr-2">
                        <span class="font-semibold truncate" x-text="getGroupLabel(group, index)"></span>
                        <!-- Botón eliminar (solo si hay >1 grupo) -->
                        <div x-show="inputGroups.length > 1" class="flex items-center gap-2" @click.stop>
                        <progress class="progress progress-error w-16 h-2"
                                  :value="deleteProgress[group.id] || 0" max="100"
                                  x-show="(deleteProgress[group.id] || 0) > 0"
                                  x-transition></progress>
                        <button class="btn btn-sm btn-ghost btn-circle text-error"
                                @mousedown="startDeleteHold(group.id)"
                                @mouseup="cancelDeleteHold(group.id)"
                                @mouseleave="cancelDeleteHold(group.id)"
                                @touchstart="startDeleteHold(group.id)"
                                @touchend="cancelDeleteHold(group.id)">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        </div>
                    </div>
                </div>
                <!-- Body con campos -->
                <div class="collapse-content" x-show="!group.collapsed" x-transition>
                    <div x-html="renderGroupFields(index)"></div>
                </div>
            </div>
        </template>

        <!-- Botón agregar -->
        <button @click="addGroup()" class="btn btn-primary w-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Agregar Transacción
        </button>
    </div>

    <div class="w-1/2 p-4 sticky top-4 self-start h-screen">
        <div class="form-control h-full">
            <label class="label">
                <span class="label-text text-lg font-semibold">Output Generado</span>
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
