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
