import { Elysia, t } from 'elysia'
import html, { Html } from '@elysiajs/html'
import { Layout } from './components/Layout'
import fs from 'node:fs'

const extractorHtml = fs.readFileSync('./src/extractor-content.html', 'utf8');

export const extractor = new Elysia()
	.use(html())
	.get('/extractor-content', () => new Response(extractorHtml, {
		headers: {
			'Content-Type': 'text/html'
		}
	}))
	.get('/', ({ html }) => html(
		Html.createElement(Layout, {})
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
	.get('/queries', ({ html }) => html(
		Html.createElement('html', { 'data-theme': 'abyss' },
			Html.createElement('head', {},
				Html.createElement('script', { defer: true, src: 'https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js' }),
				Html.createElement('style', {}, '@import "assets/css/style.css";')
			),
			Html.createElement('body', {},
				Html.createElement('div', { class: 'navbar bg-primary text-primary-content' },
					Html.createElement('div', { class: 'flex-1' },
						Html.createElement('a', { href: '/', class: 'btn btn-ghost text-xl' }, 'Mensajeria')
					),
					Html.createElement('div', {},
						Html.createElement('a', { href: '/queries', class: 'btn btn-ghost' }, 'Queries')
					)
				),
				Html.createElement('div', { 
					class: 'flex flex-row h-screen', 
					'x-data': '{ queryInput: "", get processedCode() { return processQuery(this.queryInput); } }'
				},
					Html.createElement('div', { class: 'w-1/2 p-4' },
						Html.createElement('div', { class: 'form-control h-full' },
							Html.createElement('label', { class: 'label' },
								Html.createElement('span', { class: 'label-text text-lg font-semibold' }, 'Input Query')
							),
							Html.createElement('textarea', {
								class: 'textarea textarea-bordered h-5/6 w-full',
								placeholder: 'Enter your query here...',
								'x-model': 'queryInput'
							})
						)
					),
					Html.createElement('div', { class: 'w-1/2 p-4' },
						Html.createElement('div', { class: 'form-control h-full' },
							Html.createElement('label', { class: 'label' },
								Html.createElement('span', { class: 'label-text text-lg font-semibold' }, 'Generated Code')
							),
							Html.createElement('div', { class: 'mockup-code h-5/6 w-full overflow-auto' },
								Html.createElement('pre', { class: 'text-warning-content whitespace-pre-wrap' },
									Html.createElement('code', {
										class: 'pl-4 block',
										'x-text': 'processedCode'
									})
								)
							)
						)
					)
				),
				Html.createElement('script', { src: 'assets/js/queries.js' })
			)
		)
	))
