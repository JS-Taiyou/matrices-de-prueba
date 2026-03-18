import { db } from "./database";

export interface Field {
  id: number;
  title: string;
  is_optional: boolean;
  type: string;
  helper: string | null;
  father_field: number | null;
  is_composite: boolean;
  default_value: string | null;
  output_label: string | null;
}

export interface FieldOption {
  id: number;
  value: string;
  field_id: number;
  label: string | null;
}

export function getAllFields(): Field[] {
  return db.query("SELECT * FROM fields ORDER BY id").all() as Field[];
}

export function getRootFields(): Field[] {
  return db.query("SELECT * FROM fields WHERE father_field IS NULL ORDER BY id").all() as Field[];
}

export function getChildFields(parentId: number): Field[] {
  return db.query("SELECT * FROM fields WHERE father_field = $parentId ORDER BY id").all({ $parentId: parentId }) as Field[];
}

export function getFieldById(id: number): Field | null {
  return db.query("SELECT * FROM fields WHERE id = $id").get({ $id: id }) as Field | null;
}

export function getOptionsForField(fieldId: number): FieldOption[] {
  return db.query("SELECT * FROM field_options WHERE field_id = $fieldId ORDER BY id").all({ $fieldId: fieldId }) as FieldOption[];
}

export function getAllOptions(): FieldOption[] {
  return db.query("SELECT * FROM field_options ORDER BY field_id, id").all() as FieldOption[];
}

export function getFieldsWithOptions(): (Field & { options: FieldOption[] })[] {
  const fields = getAllFields();
  const options = getAllOptions();
  
  return fields.map(field => ({
    ...field,
    options: options.filter(opt => opt.field_id === field.id)
  }));
}
