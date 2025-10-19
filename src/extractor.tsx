import { Elysia, t } from 'elysia'
import html, { Html } from '@elysiajs/html'
import { Layout } from './components/Layout'
import fs from 'node:fs'



export const extractor = new Elysia()
	.use(html())
	.get('/', ({ html }) => html(
		<Layout>
             <div class="flex flex-col gap-4 w-full">
                <div class="bg-base-100 border-base-300 border">
                    <div class="font-semibold">
                        Extraer mensajes
                    </div>
                </div>
                <form class="text-sm flex flex-row gap-4 w-full" method="post" action="/procesar-mensajeria" enctype="multipart/form-data" target="_blank">
                <fieldset class="fieldset bg-base-200 border border-base-300 p-4 rounded-box flex-5">
                    <legend class="fieldset-legend">Información a extraer</legend>
                    <label class="fieldset-label">
                        Matrices
                    </label>
                    <div class="flex flex-col gap-2">
                        <div class="flex gap-2">
                            <input type="text" class="input flex-1" pattern="[A-ZÑ&]{3,4}\d{6}[A-V1-9][0-9A-Z]"
                                placeholder="Nombre de matriz" id="matrix-name-0" />
                            <button type="button" class="btn btn-circle btn-sm" id="add-matrix-button">+</button>
                        </div>
                    </div>


                    <fieldset id="matrix-container" class="fieldset bg-base-200">

                    </fieldset>
                    <div class=" bottom-0 mt-auto pt-2">
                        <button class="btn btn-neutral w-full" type="submit">Procesar</button>
                    </div>
                </fieldset>

                </form>
            </div>
		</Layout>
	))
    .post('/procesar-mensajeria', ({ body }: { body: any }) => {
        const matrices = [];
        const blocks = [];
        const cases = [];
        const caseTexts = [];
        for(const entry of Object.entries(body)) {
            if(entry[0].startsWith('matrix-name')) {
                const matrixName = entry[1];
                const matrixId = entry[0].split('#')[1];
                matrices.push({
                    name: atob(matrixName),
                    matrixId: matrixId,
                    blocks: []
                });
            } else if(entry[0].startsWith('block-name')) {
                const blockName = entry[1];
                const blockId = entry[0].split('#')[2];
                blocks.push({
                    name: atob(blockName),
                    matrixId: entry[0].split('#')[1],
                    blockId: blockId,
                    cases: [],
                    toBeFound: true
                });
            } else if(entry[0].startsWith('case-date')) {
                const caseDate = entry[1];
                const caseId = entry[0].split('#')[2];
                cases.push({
                    date: caseDate.replace(/[\[\]]/g, ''),
                    caseId: caseId,
                    blockId: entry[0].split('#')[1],
                });
            } else if(entry[0].startsWith('case-text')) {
                const caseText = entry[1];
                const caseId = entry[0].split('#')[2];
                caseTexts.push({
                    text: atob(caseText),
                    caseId: caseId,
                    blockId: entry[0].split('#')[1],
                });
            }
        }
        cases.forEach(testCase => {
            testCase.text = caseTexts.find(caseText => caseText.caseId === testCase.caseId && caseText.blockId === testCase.blockId ).text;
            delete testCase.caseId;
            const block = blocks.find(block => block.blockId === testCase.blockId);
            if(block) {
                block.cases.push(testCase);
                delete testCase.blockId;
                if(block.toBeFound) {
                    matrices.find(matrix => matrix.matrixId === block.matrixId).blocks.push(block);
                    delete block.toBeFound;
                    delete block.matrixId;
                }
            }
        });
        blocks.forEach(block => delete block.blockId);
        matrices.forEach(matrix => delete matrix.matrixId);
        console.log(require('node:util').inspect(matrices, { depth: 5 }));
        // return json as downloadable file
        return new Response(JSON.stringify(matrices), {
            headers: {
                'Content-Disposition': 'attachment; filename="matrices.json"',
                'Content-Type': 'application/json'
            }
        });
    })
