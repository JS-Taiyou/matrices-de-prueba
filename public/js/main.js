document.addEventListener('alpine:initialized', () => {
    console.log('Alpine.js has finished initializing!');
});

function extractorApp() {
    return {
        matrices: [],
        newMatrixName: '',

        generateId() {
            return Math.random().toString(36).substring(2, 6);
        },

        encodeText(text) {
            return btoa(text);
        },

        addMatrix() {
            if (!this.newMatrixName.trim()) return;

            const matrix = {
                id: this.generateId(),
                name: this.newMatrixName,
                encodedName: this.encodeText(this.newMatrixName),
                blocks: []
            };

            this.matrices.push(matrix);
            this.newMatrixName = '';
        },

        addBlock(matrixId) {
            const blockName = prompt('Captura el nombre del bloque:');
            if (!blockName?.trim()) return;

            const matrix = this.matrices.find(m => m.id === matrixId);
            if (!matrix) return;

            const block = {
                id: this.generateId(),
                name: blockName,
                encodedName: this.encodeText(blockName),
                caseText: '',
                timestampText: '',
                cases: []
            };

            matrix.blocks.push(block);
        },

        editMatrix(matrixId) {
            const matrix = this.matrices.find(m => m.id === matrixId);
            if (!matrix) return;

            const newName = prompt('Editar nombre de matriz:', matrix.name);
            if (!newName?.trim() || newName === matrix.name) return;
            const trimmedText = newName.trim();

            matrix.name = trimmedText;
            matrix.encodedName = this.encodeText(trimmedText);
        },

        editBlock(matrixId, blockId) {
            const matrix = this.matrices.find(m => m.id === matrixId);
            if (!matrix) return;

            const block = matrix.blocks.find(b => b.id === blockId);
            if (!block) return;

            const newName = prompt('Editar nombre de bloque:', block.name);
            if (!newName?.trim() || newName === block.name) return;
            const trimmedText = newName.trim();

            block.name = trimmedText;
            block.encodedName = this.encodeText(trimmedText);
        },

        editCase(matrixId, blockId, caseId) {
            const matrix = this.matrices.find(m => m.id === matrixId);
            if (!matrix) return;

            const block = matrix.blocks.find(b => b.id === blockId);
            if (!block) return;

            const caseItem = block.cases.find(c => c.id === caseId);
            if (!caseItem) return;

            const newText = prompt('Editar texto del caso:', caseItem.text);
            if (!newText?.trim() || newText === caseItem.text) return;
            const trimmedText = newText.trim();

            caseItem.text = trimmedText;
            caseItem.encodedText = this.encodeText(trimmedText);
        },

        addCases(matrixId, blockId) {
            const matrix = this.matrices.find(m => m.id === matrixId);
            if (!matrix) return;

            const block = matrix.blocks.find(b => b.id === blockId);
            if (!block) return;

            const caseLines = block.caseText.split('\n').filter(line => line.trim());
            const timestamps = block.timestampText.split('\n').filter(t => t.trim());

            let caseCounter = block.cases.length + 1;

            caseLines.forEach(caseText => {
                const timestamp = timestamps.shift() || '';

                const caseItem = {
                    id: caseCounter,
                    number: caseCounter,
                    text: caseText,
                    encodedText: this.encodeText(caseText),
                    timestamp: timestamp
                };

                block.cases.push(caseItem);
                caseCounter++;
            });

            block.caseText = '';
            block.timestampText = '';
        }
    };
}
