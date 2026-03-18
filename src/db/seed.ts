import { db } from "./database";

export function seedDatabase() {
  const count = db.query("SELECT COUNT(*) as count FROM fields").get() as { count: number };
  
  if ((count as { count: number }).count > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  const insertField = db.prepare(`
    INSERT INTO fields (title, is_optional, type, helper, father_field, is_composite, default_value, output_label)
    VALUES ($title, $is_optional, $type, $helper, $father_field, $is_composite, $default_value, $output_label)
  `);

  const insertOption = db.prepare(`
    INSERT INTO field_options (value, field_id)
    VALUES ($value, $field_id)
  `);

  const fields = [
    { title: "Input", is_optional: true, type: "textarea", helper: null, father_field: null, is_composite: false, default_value: null },
    { title: "Matriz", is_optional: true, type: "text", helper: null, father_field: null, is_composite: false, default_value: null },
    
    { title: "Campo 3", is_optional: false, type: "composite", helper: null, father_field: null, is_composite: true, default_value: null },
    { title: "num1", is_optional: false, type: "number_2digit", helper: "Este es el primer número que representa X cosa en el sistema de documentación.", father_field: 3, is_composite: false, default_value: "00" },
    { title: "num2", is_optional: false, type: "number_2digit", helper: "Este es el segundo número que se utiliza para Y propósito específico.", father_field: 3, is_composite: false, default_value: "00" },
    { title: "num3", is_optional: false, type: "number_2digit", helper: "Este es el tercer número correspondiente a Z funcionalidad del sistema.", father_field: 3, is_composite: false, default_value: "00" },
    
    { title: "Campo 4", is_optional: false, type: "composite", helper: null, father_field: null, is_composite: true, default_value: null },
    { title: "num4", is_optional: false, type: "number_2digit", helper: "Este es el cuarto número que representa A cosa en el sistema.", father_field: 7, is_composite: false, default_value: "00" },
    { title: "num5", is_optional: false, type: "number_1digit", helper: "Este es el quinto número que representa B cosa en el sistema.", father_field: 7, is_composite: false, default_value: "0" },
    
    { title: "Campo R", is_optional: true, type: "select", helper: null, father_field: null, is_composite: false, default_value: "", options: ["", "55", "99"] },
    
    { title: "incluye campo XD", is_optional: true, type: "checkbox", helper: null, father_field: null, is_composite: false, default_value: "false" },
    { title: "Incluye Campo TU", is_optional: true, type: "checkbox", helper: null, father_field: null, is_composite: false, default_value: "false" },
    { title: "Incluye Campo XY", is_optional: true, type: "checkbox", helper: null, father_field: null, is_composite: false, default_value: "false" },
    
    { title: "Tipo Operación", is_optional: false, type: "select", helper: null, father_field: null, is_composite: false, default_value: "Compra", options: ["Compra", "Venta"] },
    { title: "Canal", is_optional: false, type: "select", helper: null, father_field: null, is_composite: false, default_value: "Online", options: ["Online", "Presencial"] },
    
    { title: "Incluye Código Seguro", is_optional: true, type: "checkbox_with_input", helper: null, father_field: null, is_composite: false, default_value: "false" },
    { title: "Código Seguro", is_optional: true, type: "number_6digit", helper: null, father_field: 16, is_composite: false, default_value: "" },
    
    { title: "Incluye Referencia", is_optional: true, type: "checkbox_with_input", helper: null, father_field: null, is_composite: false, default_value: "false" },
    { title: "Referencia", is_optional: true, type: "number_12digit", helper: null, father_field: 18, is_composite: false, default_value: "" },
    
    { title: "Verificación Activa", is_optional: true, type: "checkbox", helper: null, father_field: null, is_composite: false, default_value: "false" },
    
    { title: "Incluye Descripción", is_optional: true, type: "checkbox_with_input", helper: null, father_field: null, is_composite: false, default_value: "false" },
    { title: "Descripción", is_optional: true, type: "text_26char", helper: null, father_field: 21, is_composite: false, default_value: "" },
    
    { title: "Notificación SMS", is_optional: true, type: "checkbox", helper: null, father_field: null, is_composite: false, default_value: "false" },
    { title: "Notificación Email", is_optional: true, type: "checkbox", helper: null, father_field: null, is_composite: false, default_value: "false" },
    
    { title: "Validación IP", is_optional: true, type: "checkbox", helper: null, father_field: null, is_composite: false, default_value: "false" },
    { title: "Geolocalización", is_optional: true, type: "checkbox", helper: null, father_field: null, is_composite: false, default_value: "false" },
    { title: "Tokenización", is_optional: true, type: "checkbox", helper: null, father_field: null, is_composite: false, default_value: "false" },
    { title: "3DS Secure", is_optional: true, type: "checkbox", helper: null, father_field: null, is_composite: false, default_value: "false" },
    { title: "CVV Requerido", is_optional: true, type: "checkbox", helper: null, father_field: null, is_composite: false, default_value: "false" },
    { title: "Cuotas Disponibles", is_optional: true, type: "checkbox", helper: null, father_field: null, is_composite: false, default_value: "false" },
    { title: "Devolución Automática", is_optional: true, type: "checkbox", helper: null, father_field: null, is_composite: false, default_value: "false" },
    { title: "Conciliación Diaria", is_optional: true, type: "checkbox", helper: null, father_field: null, is_composite: false, default_value: "false" },
    { title: "Reporte PDF", is_optional: true, type: "checkbox", helper: null, father_field: null, is_composite: false, default_value: "false" },
    { title: "Reporte Excel", is_optional: true, type: "checkbox", helper: null, father_field: null, is_composite: false, default_value: "false" },
    { title: "Webhook Configurado", is_optional: true, type: "checkbox", helper: null, father_field: null, is_composite: false, default_value: "false" },
    { title: "Callback URL", is_optional: true, type: "checkbox", helper: null, father_field: null, is_composite: false, default_value: "false" },
    { title: "Log Extendido", is_optional: true, type: "checkbox", helper: null, father_field: null, is_composite: false, default_value: "false" },
    { title: "Modo Debug", is_optional: true, type: "checkbox", helper: null, father_field: null, is_composite: false, default_value: "false" },
    { title: "Ambiente Sandbox", is_optional: true, type: "checkbox", helper: null, father_field: null, is_composite: false, default_value: "false" },
    { title: "Rate Limit Activo", is_optional: true, type: "checkbox", helper: null, father_field: null, is_composite: false, default_value: "false" },
    { title: "Caché Habilitado", is_optional: true, type: "checkbox", helper: null, father_field: null, is_composite: false, default_value: "false" },
    { title: "Backup Automático", is_optional: true, type: "checkbox", helper: null, father_field: null, is_composite: false, default_value: "false" },
    { title: "Encripción Datos", is_optional: true, type: "checkbox", helper: null, father_field: null, is_composite: false, default_value: "false" },
    { title: "Auditoría Completa", is_optional: true, type: "checkbox", helper: null, father_field: null, is_composite: false, default_value: "false" },
    
    // Switch examples
    { title: "Modo Mantenimiento", is_optional: false, type: "switch", helper: null, father_field: null, is_composite: false, default_value: "off", options: ["OFF", "ON"], output_label: "Mantenimiento" },
    { title: "Habilitar Feature X", is_optional: true, type: "switch", helper: null, father_field: null, is_composite: false, default_value: "off", options: ["Desactivado", "Activado"], output_label: "Feature X" },
  ];

  for (const field of fields) {
    const result = insertField.run({
      $title: field.title,
      $is_optional: field.is_optional ? 1 : 0,
      $type: field.type,
      $helper: field.helper,
      $father_field: field.father_field,
      $is_composite: field.is_composite ? 1 : 0,
      $default_value: field.default_value,
      $output_label: (field as any).output_label || null,
    });
    
    if (field.options && (field.type === 'select' || field.type === 'switch')) {
      const fieldId = db.query("SELECT last_insert_rowid() as id").get() as { id: number };
      for (const optionValue of field.options) {
        insertOption.run({
          $value: optionValue,
          $field_id: fieldId.id,
        });
      }
    }
  }

  console.log("Database seeded successfully!");
}

seedDatabase();
