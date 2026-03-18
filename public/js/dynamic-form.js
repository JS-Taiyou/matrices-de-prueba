// Dynamic form handling for documentacion page
function documentacionApp() {
  return {
    fields: [],
    fieldValues: {},
    focusStates: {},

    formatNumber(value) {
      const digits = (value || '').replace(/\D/g, "").slice(-2);
      return digits.padStart(2, "0");
    },

    formatSingleDigit(value) {
      const digits = (value || '').replace(/\D/g, "").slice(-1);
      return digits || "0";
    },

    format6Digits(value) {
      const digits = (value || '').replace(/\D/g, "").slice(-6);
      return digits.padStart(6, "0");
    },

    format12Digits(value) {
      const digits = (value || '').replace(/\D/g, "").slice(-12);
      return digits.padStart(12, "0");
    },

    async init() {
      try {
        const response = await fetch('/api/fields');
        this.fields = await response.json();
        
        this.fields.forEach(field => {
          const varName = `field_${field.id}`;
          
          if (field.type === 'checkbox' || field.type === 'checkbox_with_input') {
            this.fieldValues[varName] = field.default_value === 'true';
          } else if (field.default_value !== null && field.default_value !== '') {
            this.fieldValues[varName] = field.default_value;
          } else {
            this.fieldValues[varName] = '';
          }
          
          if (field.helper) {
            this.focusStates[`focus_${varName}`] = false;
          }
        });
      } catch (error) {
        console.error('Error loading fields:', error);
      }
    },

    get processedCode() {
      return processDocumentacionDynamic(this.fields, this.fieldValues);
    }
  };
}

window.documentacionApp = documentacionApp;
