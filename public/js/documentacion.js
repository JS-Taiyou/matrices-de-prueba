// Documentation processing logic - Dynamic version

function processDocumentacionDynamic(fields, fieldValues) {
  const getFieldVal = (id) => {
    const field = fields.find(f => f.id === id);
    if (!field) return '';

    // For switch types, compute value from toggle state + options
    if (field.type === 'switch') {
      const toggleState = fieldValues[`switch_field_${id}`];
      const isVisible = field.is_optional ? fieldValues[`field_${id}`] : true;

      if (!isVisible) return '';

      if (field.options.length >= 2) {
        return toggleState ? field.options[1].value : field.options[0].value;
      }
      return '';
    }

    // For optional selects, check visibility and use _select suffix
    if (field.type === 'select' && field.is_optional) {
      const isVisible = fieldValues[`field_${id}`];
      if (!isVisible) return '';
      return fieldValues[`field_${id}_select`] || '';
    }

    return fieldValues[`field_${id}`] || '';
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
    const isVisible = fieldValues['field_10'];
    const selectedValue = fieldValues['field_10_select'] || '';
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
      //console.log(`Field ${id} (${field.title}): type=${field.type}, value=${val}, output_label=${field.output_label}`);
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
        const isOn = fieldValues[`switch_field_${id}`];
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

// Alpine.js component - properties initialized upfront with defaults
function documentacionApp() {
  return {
    fields: [],
    loading: true,

    // Field values - initialized with defaults, updated from API in init()
    field_1: '',
    field_2: '',
    field_3: '',
    field_4: '00',
    field_5: '00',
    field_6: '00',
    field_7: '',
    field_8: '00',
    field_9: '0',
    field_10: false,
    field_10_select: '',
    field_11: false,
    field_12: false,
    field_13: false,
    field_14: '4',
    field_15: '02',
    field_16: false,
    field_17: '',
    field_18: false,
    field_19: '',
    field_20: false,
    field_21: false,
    field_22: '',
    field_23: false,
    field_24: false,
    field_25: false,
    field_26: false,
    field_27: false,
    field_28: false,
    field_29: false,
    field_30: false,
    field_31: false,
    field_32: false,
    field_33: false,
    field_34: false,
    field_35: false,
    field_36: false,
    field_37: false,
    field_38: false,
    field_39: false,
    field_40: false,
    field_41: false,
    field_42: false,
    field_43: false,
    field_44: false,
    field_45: false,
    field_46: false,
    field_47: '',
    field_48: '',
    field_49: '',
    field_50: '',

    // Switch toggle states
    switch_field_42: false,
    switch_field_46: false,

    // Focus states for helpers
    focus_field_4: false,
    focus_field_5: false,
    focus_field_6: false,
    focus_field_8: false,
    focus_field_9: false,

    // Hover states for checkbox helpers (initialized dynamically)
    hover_field_1: false,
    hover_field_2: false,
    hover_field_3: false,
    hover_field_11: false,
    hover_field_12: false,
    hover_field_13: false,
    hover_field_14: false,
    hover_field_15: false,
    hover_field_16: false,
    hover_field_17: false,
    hover_field_18: false,
    hover_field_19: false,
    hover_field_20: false,
    hover_field_21: false,
    hover_field_22: false,
    hover_field_23: false,
    hover_field_24: false,
    hover_field_25: false,
    hover_field_26: false,
    hover_field_27: false,
    hover_field_28: false,
    hover_field_29: false,
    hover_field_30: false,
    hover_field_31: false,
    hover_field_32: false,
    hover_field_33: false,
    hover_field_34: false,
    hover_field_35: false,
    hover_field_36: false,
    hover_field_37: false,
    hover_field_38: false,
    hover_field_39: false,
    hover_field_40: false,
    hover_field_41: false,
    hover_field_42: false,
    hover_field_43: false,
    hover_field_44: false,
    hover_field_45: false,
    hover_field_46: false,
    hover_field_47: false,
    hover_field_48: false,
    hover_field_49: false,
    hover_field_50: false,

    async init() {
      // Load fields from API
      const response = await fetch('/api/fields');
      this.fields = await response.json();
      this.loading = false;

      // Update field values with defaults from database
      this.fields.forEach(field => {
        const varName = `field_${field.id}`;
        const switchName = `switch_field_${field.id}`;
        const focusName = `focus_field_${field.id}`;
        const hoverName = `hover_field_${field.id}`;
        const selectName = `field_${field.id}_select`;

        // Update field value from database default
        if (field.type === 'checkbox' || field.type === 'checkbox_with_input') {
          this[varName] = field.default_value === 'true';
        } else if (field.type === 'switch') {
          this[varName] = field.is_optional ? (field.default_value === 'true') : true;
          this[switchName] = field.default_value === 'on' || field.default_value === 'true';
        } else if (field.type === 'select' && field.is_optional) {
          this[varName] = false;
          // Use first option as default if no default_value
          const firstOption = field.options[0]?.value || '';
          this[selectName] = field.default_value || firstOption;
        } else if (field.type === 'select') {
          // Non-optional selects: use first option as default if no default_value
          const firstOption = field.options[0]?.value || '';
          this[varName] = field.default_value || firstOption;
        } else if (field.default_value !== null && field.default_value !== '') {
          this[varName] = field.default_value;
        }

        // Initialize focus/hover state for fields with helpers
        if (field.helper) {
          this[focusName] = false;
          this[hoverName] = false;
        }
      });
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

    // Computed output
    get processedCode() {
      if (this.loading || !this.fields.length) return 'Cargando...';
      return processDocumentacionDynamic(this.fields, this);
    }
  };
}
