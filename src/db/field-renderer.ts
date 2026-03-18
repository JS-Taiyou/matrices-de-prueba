import type { Field, FieldOption } from "./queries";

export function renderFieldHtml(field: Field & { options: FieldOption[] }, allFields: (Field & { options: FieldOption[] })[]): string {
  const varName = `field_${field.id}`;
  
  switch (field.type) {
    case 'textarea':
      return `
        <div class="form-control">
          <label class="label">
            <span class="label-text text-lg font-semibold">${escapeHtml(field.title)}</span>
          </label>
          <textarea class="textarea textarea-bordered w-full" rows="3" placeholder="Enter your ${escapeHtml(field.title.toLowerCase())} here..."
            x-model="${varName}" @focus="$el.select()"></textarea>
        </div>`;

    case 'text':
      return `
        <div class="form-control mt-4">
          <label class="label">
            <span class="label-text">${escapeHtml(field.title)}</span>
          </label>
          <input type="text" class="input input-bordered w-full" placeholder="Enter ${escapeHtml(field.title.toLowerCase())}..." 
            x-model="${varName}" @focus="$el.select()" />
        </div>`;

    case 'composite':
      const children = allFields.filter(f => f.father_field === field.id);
      if (children.length === 0) return '';
      const childrenHtml = children.map(child => renderFieldHtml(child, allFields)).join('\n');
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
            x-model="${varName}"
            @focus="focus_${varName} = true; $el.select()"
            @blur="${varName} = formatNumber(${varName}); focus_${varName} = false" />
          ${field.helper ? `
          <div class="absolute left-4 right-4 top-full mt-2 px-3 py-2 bg-base-300 text-base-content text-sm rounded-lg shadow-xl z-10 transition-opacity duration-200 min-w-[300px] max-w-[600px] w-fit mx-auto text-nowrap overflow-hidden"
            x-show="focus_${varName}" x-transition:enter="opacity-0" x-transition:enter-end="opacity-100"
            x-transition:leave="opacity-100" x-transition:leave-end="opacity-0">
            <div class="leading-relaxed">${field.helper}</div>
          </div>` : ''}
        </div>`;

    case 'number_1digit':
      return `
        <div class="relative w-1/2">
          <input type="text" class="input input-bordered w-full text-center" maxlength="1" 
            x-model="${varName}"
            @focus="focus_${varName} = true; $el.select()"
            @blur="${varName} = formatSingleDigit(${varName}); focus_${varName} = false" />
          ${field.helper ? `
          <div class="absolute left-4 right-4 top-full mt-2 px-3 py-2 bg-base-300 text-base-content text-sm rounded-lg shadow-xl z-10 transition-opacity duration-200 min-w-[300px] max-w-[600px] w-fit mx-auto text-nowrap overflow-hidden"
            x-show="focus_${varName}" x-transition:enter="opacity-0" x-transition:enter-end="opacity-100"
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
            <input type="checkbox" class="checkbox" x-model="${varName}" />
            <span class="label-text">${escapeHtml(field.title)}</span>
          </label>
          <div class="ml-8" x-show="${varName}" x-transition>
            ${field.helper ? `<div class="text-sm text-base-content/70 mb-1">${field.helper}</div>` : ''}
            <select class="select select-bordered w-full" x-model="${varName}_select">
              ${optionsHtml}
            </select>
          </div>
          ` : `
          <label class="label mb-2">
            <span class="label-text">${escapeHtml(field.title)}</span>
          </label>
          ${field.helper ? `<div class="text-sm text-base-content/70 mb-1">${field.helper}</div>` : ''}
          <select class="select select-bordered w-full" x-model="${varName}">
            ${optionsHtml}
          </select>
          `}
        </div>`;

    case 'checkbox':
      return `
        <div class="form-control mt-4 relative">
          <label class="label cursor-pointer justify-start gap-2"
            @mouseenter="hover_${varName} = true"
            @mouseleave="hover_${varName} = false">
            <input type="checkbox" class="checkbox" x-model="${varName}" />
            <span class="label-text">${escapeHtml(field.title)}</span>
          </label>
          ${field.helper ? `
          <div class="absolute left-4 right-4 top-full mt-1 px-3 py-2 bg-base-300 text-base-content text-sm rounded-lg shadow-xl z-10 transition-opacity duration-200 min-w-[300px] max-w-[600px] w-fit mx-auto text-nowrap overflow-hidden"
            x-show="hover_${varName}" x-transition:enter="opacity-0" x-transition:enter-end="opacity-100"
            x-transition:leave="opacity-100" x-transition:leave-end="opacity-0">
            <div class="leading-relaxed">${field.helper}</div>
          </div>` : ''}
        </div>`;

    case 'checkbox_with_input':
      return `
        <div class="form-control mt-4 relative">
          <label class="label cursor-pointer justify-start gap-2"
            @mouseenter="hover_${varName} = true"
            @mouseleave="hover_${varName} = false">
            <input type="checkbox" class="checkbox" x-model="${varName}" />
            <span class="label-text">${escapeHtml(field.title)}</span>
          </label>
          ${field.helper ? `
          <div class="absolute left-4 right-4 top-full mt-1 px-3 py-2 bg-base-300 text-base-content text-sm rounded-lg shadow-xl z-10 transition-opacity duration-200 min-w-[300px] max-w-[600px] w-fit mx-auto text-nowrap overflow-hidden"
            x-show="hover_${varName}" x-transition:enter="opacity-0" x-transition:enter-end="opacity-100"
            x-transition:leave="opacity-100" x-transition:leave-end="opacity-0">
            <div class="leading-relaxed">${field.helper}</div>
          </div>` : ''}
        </div>`;

    case 'number_6digit':
      const parent6 = allFields.find(f => f.id === field.father_field);
      const showCond6 = parent6 ? `field_${parent6.id}` : 'true';
      return `
        <div class="form-control mt-2" x-show="${showCond6}" x-transition>
          <label class="label">
            <span class="label-text">${escapeHtml(field.title)} (6 dígitos)</span>
          </label>
          <input type="text" class="input input-bordered w-full" maxlength="6" placeholder="000000" 
            x-model="${varName}"
            @focus="$el.select()"
            @blur="${varName} = format6Digits(${varName})" />
        </div>`;

    case 'number_12digit':
      const parent12 = allFields.find(f => f.id === field.father_field);
      const showCond12 = parent12 ? `field_${parent12.id}` : 'true';
      return `
        <div class="form-control mt-2" x-show="${showCond12}" x-transition>
          <label class="label">
            <span class="label-text">${escapeHtml(field.title)} (12 dígitos)</span>
          </label>
          <input type="text" class="input input-bordered w-full" maxlength="12" placeholder="000000000000" 
            x-model="${varName}"
            @focus="$el.select()"
            @blur="${varName} = format12Digits(${varName})" />
        </div>`;

    case 'text_26char':
      const parent26 = allFields.find(f => f.id === field.father_field);
      const showCond26 = parent26 ? `field_${parent26.id}` : 'true';
      return `
        <div class="form-control mt-2" x-show="${showCond26}" x-transition>
          <label class="label">
            <span class="label-text">${escapeHtml(field.title)} (26 caracteres)</span>
          </label>
          <input type="text" class="input input-bordered w-full" maxlength="26" placeholder="Ingrese ${escapeHtml(field.title.toLowerCase())}..." 
            x-model="${varName}" @focus="$el.select()" />
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
            <input type="checkbox" class="checkbox" x-model="${varName}" />
            <span class="label-text">${escapeHtml(field.title)}</span>
          </label>
          <div class="form-control ml-8" x-show="${varName}" x-transition>
            <label class="label cursor-pointer justify-start gap-3">
              <input type="checkbox" class="toggle" x-model="switch_${varName}" />
              <span class="label-text" x-text="switch_${varName} ? '${onLabel}' : '${offLabel}'"></span>
            </label>
          </div>
          ` : `
          <label class="label cursor-pointer justify-start gap-3">
            <input type="checkbox" class="toggle" x-model="switch_${varName}" />
            <span class="label-text">${escapeHtml(field.title)}: </span>
            <span class="label-text font-semibold" x-text="switch_${varName} ? '${onLabel}' : '${offLabel}'"></span>
          </label>
          `}
        </div>`;

    case 'static':
      return '';

    default:
      return '';
  }
}

function escapeJsString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}

export function buildAlpineDataObject(fields: (Field & { options: FieldOption[] })[]): string {
  const parts: string[] = [];
  
  fields.forEach(field => {
    const varName = `field_${field.id}`;
    
    if (field.type === 'checkbox' || field.type === 'checkbox_with_input') {
      parts.push(`${varName}: ${field.default_value === 'true'}`);
    } else if (field.default_value !== null && field.default_value !== '') {
      parts.push(`${varName}: '${escapeJsString(field.default_value)}'`);
    } else {
      parts.push(`${varName}: ''`);
    }
    
    if (field.helper) {
      parts.push(`focus_${varName}: false`);
    }
  });
  
  return `{ ${parts.join(', ')} }`;
}

function escapeHtml(text: string | null): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
