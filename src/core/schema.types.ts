export interface JsonSchema {
  // ==========================================================
  // Meta (JSON Schema Draft 2020-12)
  // ==========================================================

  $schema?: string;
  $vocabulary?: Record<string, boolean>;
  $dynamicRef?: string;
  $dynamicAnchor?: string;
  $comment?: string;
  $id?: string;
  $ref?: string;
  $defs?: Record<string, JsonSchema>;

  title?: string;
  description?: string;
  default?: unknown;
  examples?: unknown[];

  deprecated?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;

  // ==========================================================
  // Generic
  // ==========================================================

  type?: string | string[];
  const?: unknown;
  enum?: unknown[];

  allOf?: JsonSchema[];
  anyOf?: JsonSchema[];
  oneOf?: JsonSchema[];

  not?: JsonSchema;

  if?: JsonSchema;
  then?: JsonSchema;
  else?: JsonSchema;

  // ==========================================================
  // String
  // ==========================================================

  minLength?: number;
  maxLength?: number;

  pattern?: string;

  // ==========================================================
  // Number
  // ==========================================================

  minimum?: number;
  maximum?: number;

  exclusiveMinimum?: number;
  exclusiveMaximum?: number;

  multipleOf?: number;

  // ==========================================================
  // Object (Draft 2020-12 uses dependentSchemas, unevaluatedProperties)
  // ==========================================================

  properties?: Record<string, JsonSchema>;

  required?: string[];

  additionalProperties?: boolean | JsonSchema;

  propertyNames?: JsonSchema;

  minProperties?: number;
  maxProperties?: number;

  patternProperties?: Record<string, JsonSchema>;

  dependentRequired?: Record<string, string[]>;
  dependentSchemas?: Record<string, JsonSchema>;
  unevaluatedProperties?: boolean | JsonSchema;

  // ==========================================================
  // Array
  // ==========================================================

  items?: JsonSchema | boolean;

  prefixItems?: JsonSchema[];

  contains?: JsonSchema;

  minItems?: number;
  maxItems?: number;

  uniqueItems?: boolean;

  // ==========================================================
  // Content (Draft 2020-12)
  // ==========================================================

  contentMediaType?: string;
  contentEncoding?: string;
  contentSchema?: JsonSchema;

  // ==========================================================
  // Format (Draft 2020-12 annotation)
  // ==========================================================

  format?: string;
}
