document.addEventListener('alpine:initialized', () => {
    console.log('Alpine.js has finished initializing!');
});

function extractorApp() {
    return {
        matrices: [],
        newMatrixName: '',
        deleteTimers: {},
        deleteProgress: {},
        longPressTriggered: {},

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
            console.log('Matrix added:', matrix);
        },

        removeMatrix(matrixId) {
            this.matrices = this.matrices.filter(m => m.id !== matrixId);
            delete this.deleteProgress[matrixId];
            delete this.deleteTimers[matrixId];
            delete this.longPressTriggered[matrixId];
        },

        startMatrixLongPress(matrixId) {
            this.longPressTriggered[matrixId] = false;
            const startTime = Date.now();
            const cancelThreshold = 500; // 500ms to cancel click
            const deleteThreshold = 1000; // 1000ms total to delete

            this.deleteTimers[matrixId] = setInterval(() => {
                const elapsed = Date.now() - startTime;

                // After 500ms, mark as long press (cancel click)
                if (elapsed >= cancelThreshold && !this.longPressTriggered[matrixId]) {
                    this.longPressTriggered[matrixId] = true;
                }

                // After 500ms, start showing progress (500-1000ms range)
                if (elapsed >= cancelThreshold) {
                    const progressElapsed = elapsed - cancelThreshold;
                    const progressDuration = deleteThreshold - cancelThreshold; // 500ms
                    this.deleteProgress[matrixId] = Math.min(100, (progressElapsed / progressDuration) * 100);
                }

                // At 1000ms, delete the matrix
                if (elapsed >= deleteThreshold) {
                    this.removeMatrix(matrixId);
                }
            }, 50);
        },

        cancelMatrixLongPress(matrixId) {
            if (this.deleteTimers[matrixId]) {
                clearInterval(this.deleteTimers[matrixId]);
                delete this.deleteTimers[matrixId];
            }
            this.deleteProgress[matrixId] = 0;
        },

        handleMatrixClick(matrixId) {
            // If long press was triggered, don't edit
            if (this.longPressTriggered[matrixId]) {
                this.longPressTriggered[matrixId] = false;
                return;
            }
            this.editMatrix(matrixId);
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
                caseLines: 0,
                timestampLines: 0,
                cases: []
            };

            matrix.blocks.push(block);
            console.log('Block added:', block);
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
        },

        hasPendingCases() {
            return this.matrices.some(matrix => 
                matrix.blocks.some(block => 
                    block.caseText.trim() || block.timestampText.trim()
                )
            );
        },

        addAllPendingCases() {
            this.matrices.forEach(matrix => {
                matrix.blocks.forEach(block => {
                    if (block.caseText.trim() || block.timestampText.trim()) {
                        this.addCases(matrix.id, block.id);
                    }
                });
            });
        },

        checkPendingCasesAndSubmit(event) {
            if (this.hasPendingCases()) {
                event.preventDefault();
                
                if (confirm('¿Deseas incluir los casos pendientes de agregar?')) {
                    this.addAllPendingCases();
                    // Submit the form after adding pending cases
                    setTimeout(() => {
                        event.target.form.submit();
                    }, 100);
                } else {
                    // Submit the form without adding pending cases
                    event.target.form.submit();
                }
            }
            // If no pending cases, let form submit normally
        },

        countValidLines(text) {
            const lines = text.split('\n').filter(line => line.trim());
            return lines.length;
        }
    };
}
