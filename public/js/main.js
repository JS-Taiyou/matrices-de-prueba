'use strict';
const matrixContainer = document.getElementById('matrix-container');
const addMatrixButton = document.getElementById('add-matrix-button');
const addCaseButton = document.getElementById('add-case-button');
const matrixNameInput = document.getElementById('matrix-name-0');

function addCase (blockId, caseTextInput, timestampInput) {
    caseTextInput.value = caseTextInput.value.trim();
    // Check if case input is empty
    if (!caseTextInput.value.trim().length) {
        return;
    }
    timestampInput.value = timestampInput.value.trim();


    const isMultiple = caseTextInput.value.includes('\n');
    const timestamps = timestampInput.value.split('\n').filter(part => part.trim().length);

    if(isMultiple) {
        const cases = caseTextInput.value.split('\n').filter(part => part.trim().length);
        cases.forEach(caseText => {
            const timestamp = timestamps.shift();
            spawnCase(blockId, caseText, timestamp);
        });
    } else {
        const timestamp = timestamps.shift();
        spawnCase(blockId, caseTextInput.value, timestamp);
    }
    caseTextInput.value = '';
    timestampInput.value = '';
    
}

function spawnCase(blockId, caseText, timestamp) {
    const legend = document.createElement('legend');
    legend.classList.add('fieldset-legend', 'ml-4', 'block');
    const label = document.createElement('label');
    label.classList.add('fieldset-label', 'w-full', 'ml-4');
    label.innerHTML = 'Timestamp';
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Timestamp';
    const nextCaseNumber = findLastCase(blockId);
    input.name = `case-date#${blockId}#case-${nextCaseNumber}`;
    legend.innerHTML = caseText + `<div class="badge badge-soft badge-info ml-2">Caso #${nextCaseNumber}</div>`;

    input.classList.add('input', 'ml-4');
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = `case-text#${blockId}#case-${nextCaseNumber}`;
    hiddenInput.value = btoa(caseText);
    if(timestamp) {
        input.value = timestamp;
    }
    findLastCase(blockId, true).after(legend, label, hiddenInput, input);
}


function addMatrixBlock(matrixId, blockNameInput){
    blockNameInput.value = blockNameInput.value.trim();
    // Check if block name is empty
    if (!blockNameInput.value.trim().length) {
        return;
    }
    
    const randomAlphanumeric = Math.random().toString(36).substring(2, 6);
    const legend = document.createElement('legend');
    legend.classList.add('fieldset-legend', 'block');
    legend.innerHTML = blockNameInput.value + `<div class="badge badge-info ml-2">Bloque</div>`;
    const label = document.createElement('label');
    label.classList.add('fieldset-label');
    label.innerHTML = 'Casos';
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = `block-name#${matrixId}#${randomAlphanumeric}`;
    hiddenInput.value = btoa(blockNameInput.value);
    const div = document.createElement('div');
    div.classList.add('flex', 'flex-col', 'gap-2', 'w-5/6');
    const secondDiv = document.createElement('div');
    secondDiv.classList.add('flex', 'gap-2');
    const input = document.createElement('textarea');
    input.rows = 5;
    input.placeholder = 'Caso o casos de prueba';
    input.id = `add-case-${randomAlphanumeric}`;
    const timestampInput = input.cloneNode(true);
    input.classList.add('input', 'flex-3', 'h-[150px]');
    timestampInput.classList.add('input', 'flex-1', 'h-[150px]');
    timestampInput.placeholder = 'Timestamps de los casos (opcional)';
    timestampInput.id = `add-case-timestamp-${randomAlphanumeric}`;
    

    const newBlockAddCaseButton = document.createElement('button');
    newBlockAddCaseButton.type = 'button';
    newBlockAddCaseButton.classList.add('btn', 'btn-circle', 'btn-sm');
    newBlockAddCaseButton.innerHTML = '+';
    newBlockAddCaseButton.id = `add-case-button-${randomAlphanumeric}`;
    
    // Find the matrix container and append the block
    const matrixElement = document.querySelector(`[data-matrix-id="${matrixId}"]`);
    if (matrixElement) {
        matrixElement.append(legend, label, hiddenInput, div);
        div.append(secondDiv);
        secondDiv.append(input, timestampInput, newBlockAddCaseButton);
        newBlockAddCaseButton.addEventListener('click', addCase.bind(null, randomAlphanumeric, input, timestampInput));
    }

    blockNameInput.value = '';
}

function findLastCase (blockId, returnDiv = false) {
    const cases = [... document.querySelectorAll(`textarea[id="add-case-${blockId}"], input[name^="case-date#${blockId}#"]`)];
    const lastCase = cases[cases.length - 1];
    if(returnDiv) {
        if(lastCase.id === `add-case-${blockId}`) {
            return lastCase.closest('div.flex.flex-col.gap-2')
        }
        return lastCase;
    }
    return cases.length
}

addMatrixButton.addEventListener('click', function() {
    matrixNameInput.value = matrixNameInput.value.trim();
    // Check if matrix name input is empty
    if (!matrixNameInput.value.trim().length) {
        return;
    }
    
    const randomAlphanumeric = Math.random().toString(36).substring(2, 6);
    const legend = document.createElement('legend');
    legend.classList.add('fieldset-legend', 'block');
    legend.innerHTML = matrixNameInput.value + `<div class="badge badge-success ml-2">Matriz</div>`;
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = `matrix-name#${randomAlphanumeric}`;
    hiddenInput.value = btoa(matrixNameInput.value);
    const div = document.createElement('div');
    div.classList.add('flex', 'flex-col', 'gap-2', 'pl-[16px]');
    div.setAttribute('data-matrix-id', randomAlphanumeric);
    
    // Create a button to add blocks to this matrix
    const addBlockButton = document.createElement('button');
    addBlockButton.type = 'button';
    addBlockButton.classList.add('btn', 'btn-primary', 'mb-4');
    addBlockButton.innerHTML = 'Nuevo bloque';
    addBlockButton.id = `add-block-button-${randomAlphanumeric}`;
    
    matrixContainer.append(legend, hiddenInput, div, addBlockButton);
        
    // Add event listener for the add block button
    addBlockButton.addEventListener('click', function() {
        const blockName = prompt('Captura el nombre del bloque:');
        if (blockName && blockName.trim()) {
            const blockNameInput = { value: blockName };
            addMatrixBlock(randomAlphanumeric, blockNameInput);
        }
    });
    matrixNameInput.value = '';
});

matrixNameInput.addEventListener('keypress', function(event) {
    if(event.key === 'Enter') {
        event.preventDefault();
        addMatrixButton.dispatchEvent(new Event('click'));
    }
});
