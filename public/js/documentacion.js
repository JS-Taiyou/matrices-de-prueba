// Documentation processing logic - Multi-group version

function processDocumentacionDynamic(fields, groupValues) {
  const getFieldVal = (id) => {
    const field = fields.find(f => f.id === id);
    if (!field) return '';

    // For switch types, compute value from toggle state + options
    if (field.type === 'switch') {
      const toggleState = groupValues[`switch_field_${id}`];
      const isVisible = field.is_optional ? groupValues[`field_${id}`] : true;

      if (!isVisible) return '';

      if (field.options.length >= 2) {
        return toggleState ? field.options[1].value : field.options[0].value;
      }
      return '';
    }

    // For optional selects, check visibility and use _select suffix
    if (field.type === 'select' && field.is_optional) {
      const isVisible = groupValues[`field_${id}`];
      if (!isVisible) return '';
      return groupValues[`field_${id}_select`] || '';
    }

    return groupValues[`field_${id}`] || '';
  };

  const getField = (id) => fields.find(f => f.id === id);
  const outputRender = (field) => `${field.title} = ${field.output_label}`;
  const conditionalOutput = (field_id) => { if (getFieldVal(field_id)) return outputRender(getField(field_id)) + '\n'; return '' };

  const docInput = getFieldVal(2);
  const matriz = getFieldVal(1);

  const values = docInput.split('\t').map(x => x.trim()).filter((x, i) => i === 0 ? x.match(/^[0-9]+$/) === null : x.length > 0);
  let output = '';

  if (matriz && matriz.length > 0) {
    const [trxType, trxMode, emisor, cardType] = values;
    const result = values[values.length - 1];
    output = `La transacción de ${trxType} ${trxMode} ${emisor} ${cardType} ${matriz} debe ser ${result}, y debe estar correcta en el mensaje considerando.`;
  }

  let result = `${output || ''}\n`;

  // Campo 3 (composite: num1, num2, num3)
  result += `${getField(3).output_label} = ${getFieldVal(4)}${getFieldVal(5)}${getFieldVal(6)}\n`;
  result += `${getField(45).output_label}\n`;
  result += `${getField(7).title} = ${getFieldVal(8)}${getFieldVal(9)}\n`;

  const firstOptSelect = getField(10);
  if (firstOptSelect && firstOptSelect.is_optional) {
    const isVisible = groupValues['field_10'];
    const selectedValue = groupValues['field_10_select'] || '';
    if (isVisible) {
      result += `${firstOptSelect.title} = ${selectedValue}\n`;
    }
  }
  result += conditionalOutput(11);
  // Fixed outputs
  result += `${getField(47).output_label}\n${getField(48).output_label}\n`;
  result += conditionalOutput(12);
  result += conditionalOutput(13);
  result += `Campo 63:\n`;

  // Fields 14-46: handle different types
  for (let id = 14; id <= 46; id++) {
    const field = getField(id);
    if (!field) continue;

    if (field.type === 'checkbox') {
      const val = getFieldVal(id);
      if (val) {
        result += `  ${field.title} = ${field.output_label}\n`;
      }
    } else if (field.type === 'checkbox_with_input') {
      if (getFieldVal(id)) {
        const childField = getField(id + 1);
        if (childField) {
          const inputValue = getFieldVal(id + 1);
          if (inputValue && childField.output_label) {
            const output = childField.output_label.replace('@@@', inputValue);
            result += `  ${childField.title} = ${output}\n`;
          }
        }
      }
    } else if (field.type === 'switch') {
      const isVisible = field.is_optional ? getFieldVal(id) : true;
      if (isVisible && field.options.length >= 2) {
        const isOn = groupValues[`switch_field_${id}`];
        const optionValue = isOn ? field.options[1].value : field.options[0].value;
        result += `  ${field.title} = ${optionValue}\n`;
      }
    } else if (field.type === 'select') {
      const val = getFieldVal(id);
      if (val && field.output_label) {
        const output = field.output_label.replace('@@@', val);
        result += `  ${field.title} = ${output}\n`;
      }
    }
  }

  return result || "// Esperando transacciones...";
}

// Client-side field renderer - generates HTML with Alpine bindings for a specific group
function renderFieldClient(field, allFields, groupIndex) {
  const varName = `field_${field.id}`;
  const modelPrefix = `inputGroups[${groupIndex}]`;
  const modelVar = `${modelPrefix}.${varName}`;
  const switchVar = `${modelPrefix}.switch_${varName}`;
  const focusVar = `${modelPrefix}.focus_${varName}`;
  const hoverVar = `${modelPrefix}.hover_${varName}`;
  const selectVar = `${modelPrefix}.${varName}_select`;

  const escapeHtml = (text) => {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const getParentVar = (parentId) => {
    if (!parentId) return 'true';
    return `${modelPrefix}.field_${parentId}`;
  };

  switch (field.type) {
    case 'textarea':
      return `
        <div class="form-control">
          <label class="label">
            <span class="label-text text-lg font-semibold">${escapeHtml(field.title)}</span>
          </label>
          <textarea class="textarea textarea-bordered w-full" rows="3" placeholder="Enter your ${escapeHtml(field.title.toLowerCase())} here..."
            x-model="${modelVar}" @focus="$el.select()"></textarea>
        </div>`;

    case 'text':
      return `
        <div class="form-control mt-4">
          <label class="label">
            <span class="label-text">${escapeHtml(field.title)}</span>
          </label>
          <input type="text" class="input input-bordered w-full" placeholder="Enter ${escapeHtml(field.title.toLowerCase())}..."
            x-model="${modelVar}" @focus="$el.select()" />
        </div>`;

    case 'composite':
      const children = allFields.filter(f => f.father_field === field.id);
      if (children.length === 0) return '';
      const childrenHtml = children.map(child => renderFieldClient(child, allFields, groupIndex)).join('\n');
      return `
        <div class="form-control mt-4">
          <label class="label mb-2">
            <span class="label-text">${escapeHtml(field.title)}</span>
          </label>
          <div class="flex gap-2">
            ${childrenHtml}
          </div>
        </div>`;

    case 'number_2digit':
      return `
        <div class="relative w-1/3">
          <input type="text" class="input input-bordered w-full text-center" maxlength="2"
            x-model="${modelVar}"
            @focus="${focusVar} = true; $el.select()"
            @blur="${modelVar} = formatNumber(${modelVar}); ${focusVar} = false" />
          ${field.helper ? `
          <div class="absolute left-4 right-4 top-full mt-2 px-3 py-2 bg-base-300 text-base-content text-sm rounded-lg shadow-xl z-10 transition-opacity duration-200 min-w-[300px] max-w-[600px] w-fit mx-auto text-nowrap overflow-hidden"
            x-show="${focusVar}" x-transition:enter="opacity-0" x-transition:enter-end="opacity-100"
            x-transition:leave="opacity-100" x-transition:leave-end="opacity-0">
            <div class="leading-relaxed">${field.helper}</div>
          </div>` : ''}
        </div>`;

    case 'number_1digit':
      return `
        <div class="relative w-1/2">
          <input type="text" class="input input-bordered w-full text-center" maxlength="1"
            x-model="${modelVar}"
            @focus="${focusVar} = true; $el.select()"
            @blur="${modelVar} = formatSingleDigit(${modelVar}); ${focusVar} = false" />
          ${field.helper ? `
          <div class="absolute left-4 right-4 top-full mt-2 px-3 py-2 bg-base-300 text-base-content text-sm rounded-lg shadow-xl z-10 transition-opacity duration-200 min-w-[300px] max-w-[600px] w-fit mx-auto text-nowrap overflow-hidden"
            x-show="${focusVar}" x-transition:enter="opacity-0" x-transition:enter-end="opacity-100"
            x-transition:leave="opacity-100" x-transition:leave-end="opacity-0">
            <div class="leading-relaxed">${field.helper}</div>
          </div>` : ''}
        </div>`;

    case 'select':
      const optionsHtml = field.options.map(opt => {
        const displayText = opt.label ? `${escapeHtml(opt.value)}: ${escapeHtml(opt.label)}` : escapeHtml(opt.value);
        return `<option value="${escapeHtml(opt.value)}">${displayText}</option>`;
      }).join('\n');
      return `
        <div class="form-control mt-4">
          ${field.is_optional ? `
          <label class="label cursor-pointer justify-start gap-2">
            <input type="checkbox" class="checkbox" x-model="${modelVar}" />
            <span class="label-text">${escapeHtml(field.title)}</span>
          </label>
          <div class="ml-8" x-show="${modelVar}" x-transition>
            ${field.helper ? `<div class="text-sm text-base-content/70 mb-1">${field.helper}</div>` : ''}
            <select class="select select-bordered w-full" x-model="${selectVar}">
              ${optionsHtml}
            </select>
          </div>
          ` : `
          <label class="label mb-2">
            <span class="label-text">${escapeHtml(field.title)}</span>
          </label>
          ${field.helper ? `<div class="text-sm text-base-content/70 mb-1">${field.helper}</div>` : ''}
          <select class="select select-bordered w-full" x-model="${modelVar}">
            ${optionsHtml}
          </select>
          `}
        </div>`;

    case 'checkbox':
      return `
        <div class="form-control mt-4 relative">
          <label class="label cursor-pointer justify-start gap-2"
            @mouseenter="${hoverVar} = true"
            @mouseleave="${hoverVar} = false">
            <input type="checkbox" class="checkbox" x-model="${modelVar}" />
            <span class="label-text">${escapeHtml(field.title)}</span>
          </label>
          ${field.helper ? `
          <div class="absolute left-4 right-4 top-full mt-1 px-3 py-2 bg-base-300 text-base-content text-sm rounded-lg shadow-xl z-10 transition-opacity duration-200 min-w-[300px] max-w-[600px] w-fit mx-auto text-nowrap overflow-hidden"
            x-show="${hoverVar}" x-transition:enter="opacity-0" x-transition:enter-end="opacity-100"
            x-transition:leave="opacity-100" x-transition:leave-end="opacity-0">
            <div class="leading-relaxed">${field.helper}</div>
          </div>` : ''}
        </div>`;

    case 'checkbox_with_input':
      return `
        <div class="form-control mt-4 relative">
          <label class="label cursor-pointer justify-start gap-2"
            @mouseenter="${hoverVar} = true"
            @mouseleave="${hoverVar} = false">
            <input type="checkbox" class="checkbox" x-model="${modelVar}" />
            <span class="label-text">${escapeHtml(field.title)}</span>
          </label>
          ${field.helper ? `
          <div class="absolute left-4 right-4 top-full mt-1 px-3 py-2 bg-base-300 text-base-content text-sm rounded-lg shadow-xl z-10 transition-opacity duration-200 min-w-[300px] max-w-[600px] w-fit mx-auto text-nowrap overflow-hidden"
            x-show="${hoverVar}" x-transition:enter="opacity-0" x-transition:enter-end="opacity-100"
            x-transition:leave="opacity-100" x-transition:leave-end="opacity-0">
            <div class="leading-relaxed">${field.helper}</div>
          </div>` : ''}
        </div>`;

    case 'number_6digit':
      return `
        <div class="form-control mt-2" x-show="${getParentVar(field.father_field)}" x-transition>
          <label class="label">
            <span class="label-text">${escapeHtml(field.title)} (6 dígitos)</span>
          </label>
          <input type="text" class="input input-bordered w-full" maxlength="6" placeholder="000000"
            x-model="${modelVar}"
            @focus="$el.select()"
            @blur="${modelVar} = format6Digits(${modelVar})" />
        </div>`;

    case 'number_12digit':
      return `
        <div class="form-control mt-2" x-show="${getParentVar(field.father_field)}" x-transition>
          <label class="label">
            <span class="label-text">${escapeHtml(field.title)} (12 dígitos)</span>
          </label>
          <input type="text" class="input input-bordered w-full" maxlength="12" placeholder="000000000000"
            x-model="${modelVar}"
            @focus="$el.select()"
            @blur="${modelVar} = format12Digits(${modelVar})" />
        </div>`;

    case 'text_26char':
      return `
        <div class="form-control mt-2" x-show="${getParentVar(field.father_field)}" x-transition>
          <label class="label">
            <span class="label-text">${escapeHtml(field.title)} (26 caracteres)</span>
          </label>
          <input type="text" class="input input-bordered w-full" maxlength="26" placeholder="Ingrese ${escapeHtml(field.title.toLowerCase())}..."
            x-model="${modelVar}" @focus="$el.select()" />
        </div>`;

    case 'switch':
      if (field.options.length < 2) return '';
      const [offOpt, onOpt] = field.options.slice(0, 2);
      const offLabel = escapeHtml(offOpt.label || offOpt.value);
      const onLabel = escapeHtml(onOpt.label || onOpt.value);
      return `
        <div class="form-control mt-4">
          ${field.is_optional ? `
          <label class="label cursor-pointer justify-start gap-2">
            <input type="checkbox" class="checkbox" x-model="${modelVar}" />
            <span class="label-text">${escapeHtml(field.title)}</span>
          </label>
          <div class="form-control ml-8" x-show="${modelVar}" x-transition>
            <label class="label cursor-pointer justify-start gap-3">
              <input type="checkbox" class="toggle" x-model="${switchVar}" />
              <span class="label-text" x-text="${switchVar} ? '${onLabel}' : '${offLabel}'"></span>
            </label>
          </div>
          ` : `
          <label class="label cursor-pointer justify-start gap-3">
            <input type="checkbox" class="toggle" x-model="${switchVar}" />
            <span class="label-text">${escapeHtml(field.title)}: </span>
            <span class="label-text font-semibold" x-text="${switchVar} ? '${onLabel}' : '${offLabel}'"></span>
          </label>
          `}
        </div>`;

    case 'static':
      return '';

    default:
      return '';
  }
}

// Alpine.js component - Multi-group version
function documentacionApp() {
  return {
    fields: [],
    loading: true,

    // Multi-group state
    inputGroups: [],
    nextGroupId: 1,
    deleteTimers: {},
    deleteProgress: {},

    async init() {
      // Load fields from API
      const response = await fetch('/api/fields');
      this.fields = await response.json();
      this.loading = false;

      // Create initial group
      this.inputGroups = [this.createDefaultGroup(0)];
      this.nextGroupId = 1;
    },

    // Create a new group with default values
    createDefaultGroup(id) {
      const group = { id, collapsed: false };

      // Initialize all fields with defaults from database
      this.fields.forEach(field => {
        const varName = `field_${field.id}`;

        if (field.type === 'checkbox' || field.type === 'checkbox_with_input') {
          group[varName] = field.default_value === 'true';
        } else if (field.type === 'switch') {
          group[varName] = field.is_optional ? (field.default_value === 'true') : true;
          group[`switch_${varName}`] = field.default_value === 'on' || field.default_value === 'true';
        } else if (field.type === 'select' && field.is_optional) {
          group[varName] = false;
          const firstOption = field.options[0]?.value || '';
          group[`${varName}_select`] = field.default_value || firstOption;
        } else if (field.type === 'select') {
          const firstOption = field.options[0]?.value || '';
          group[varName] = field.default_value || firstOption;
        } else if (field.default_value !== null && field.default_value !== '') {
          group[varName] = field.default_value;
        } else {
          group[varName] = '';
        }

        // Initialize focus/hover states for fields with helpers
        if (field.helper) {
          group[`focus_${varName}`] = false;
          group[`hover_${varName}`] = false;
        }
      });

      return group;
    },

    // Render fields HTML for a specific group (called from template)
    renderGroupFields(groupIndex) {
      if (this.loading || !this.fields.length) return '<div class="loading">Cargando...</div>';

      const rootFields = this.fields.filter(f => f.father_field === null);
      const htmlParts = [];

      rootFields.forEach(field => {
        // Add "Campo 63:" label before field 14
        if (field.id === 14) {
          htmlParts.push('<div class="mt-4 mb-2"><span class="label-text text-lg font-semibold">Campo 63:</span></div>');
        }

        htmlParts.push(renderFieldClient(field, this.fields, groupIndex));

        // Find and render child fields (inputs controlled by checkboxes)
        const childFields = this.fields.filter(f => f.father_field === field.id && field.type !== 'number_6digit' && field.type !== 'number_12digit' && field.type !== 'text_26char');
        childFields.forEach(child => {
          // Skip the input children of checkbox_with_input - they're handled separately
          if (field.type === 'checkbox_with_input' && child.father_field === field.id) return;
          htmlParts.push(renderFieldClient(child, this.fields, groupIndex));
        });

        // Render number and text children of checkbox_with_input
        if (field.type === 'checkbox_with_input') {
          const inputChildren = this.fields.filter(f => f.father_field === field.id);
          inputChildren.forEach(child => {
            htmlParts.push(renderFieldClient(child, this.fields, groupIndex));
          });
        }
      });

      return htmlParts.join('\n');
    },

    // Add a new group
    addGroup() {
      // Collapse all existing groups
      this.inputGroups.forEach(g => g.collapsed = true);

      // Create new group
      const newGroup = this.createDefaultGroup(this.nextGroupId++);
      this.inputGroups.push(newGroup);

      // Scroll to the new group after render
      this.$nextTick(() => {
        const groups = document.querySelectorAll('.collapse');
        if (groups.length > 0) {
          groups[groups.length - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    },

    // Start delete hold timer
    startDeleteHold(groupId) {
      if (this.inputGroups.length <= 1) return;

      this.deleteProgress[groupId] = 0;
      const startTime = Date.now();
      const duration = 1000;

      this.deleteTimers[groupId] = setInterval(() => {
        const elapsed = Date.now() - startTime;
        this.deleteProgress[groupId] = Math.min(100, (elapsed / duration) * 100);

        if (elapsed >= duration) {
          this.removeGroup(groupId);
        }
      }, 50);
    },

    // Cancel delete hold timer
    cancelDeleteHold(groupId) {
      if (this.deleteTimers[groupId]) {
        clearInterval(this.deleteTimers[groupId]);
        delete this.deleteTimers[groupId];
      }
      this.deleteProgress[groupId] = 0;
    },

    // Remove a group
    removeGroup(groupId) {
      if (this.inputGroups.length <= 1) return;

      // Clean up timer
      if (this.deleteTimers[groupId]) {
        clearInterval(this.deleteTimers[groupId]);
        delete this.deleteTimers[groupId];
      }
      delete this.deleteProgress[groupId];

      // Remove group
      this.inputGroups = this.inputGroups.filter(g => g.id !== groupId);
    },

    // Toggle group collapse
    toggleCollapse(groupId) {
      const group = this.inputGroups.find(g => g.id === groupId);
      if (group) {
        group.collapsed = !group.collapsed;
      }
    },

    // Get label for group header
    getGroupLabel(group, index) {
      const matriz = group.field_1 || '';
      const docInput = group.field_2 || '';
      // Split by tab character and get first non-empty element
      const parts = docInput.split('\t');
      let trxType = '';
      for (let i = 0; i < parts.length; i++) {
        const trimmed = parts[i].trim();
        // Skip purely numeric values at the start (matching original filter logic)
        if (i === 0 && trimmed.match(/^[0-9]+$/)) {
          continue;
        }
        if (trimmed.length > 0) {
          trxType = trimmed;
          break;
        }
      }

      if (matriz && trxType) {
        return `${matriz} (${trxType})`;
      }
      return `Transacción ${index + 1}`;
    },

    // Formatting methods
    formatNumber(value) {
      const digits = (value || '').replace(/\D/g, '').slice(-2);
      return digits.padStart(2, '0');
    },

    formatSingleDigit(value) {
      const digits = (value || '').replace(/\D/g, '').slice(-1);
      return digits || '0';
    },

    format6Digits(value) {
      const digits = (value || '').replace(/\D/g, '').slice(-6);
      return digits.padStart(6, '0');
    },

    format12Digits(value) {
      const digits = (value || '').replace(/\D/g, '').slice(-12);
      return digits.padStart(12, '0');
    },

    // Computed output - combines all groups
    get processedCode() {
      if (this.loading || !this.fields.length) return 'Cargando...';

      return this.inputGroups.map((group, index) => {
        const label = this.getGroupLabel(group, index);
        const result = processDocumentacionDynamic(this.fields, group);
        return `=== ${label} ===\n${result}`;
      }).join('\n');
    }
  };
}
