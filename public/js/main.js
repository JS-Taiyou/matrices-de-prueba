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