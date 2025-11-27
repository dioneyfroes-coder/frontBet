#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';

type OpenAPIDoc = Record<string, unknown>;

const input = path.resolve(process.cwd(), 'docs da backend/openapi.json');
const outDir = path.resolve(process.cwd(), 'src/lib/schemas');
const outFile = path.join(outDir, 'generated-schemas.ts');

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9_]/g, '_');
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function schemaToZod(name: string, schema: unknown, components: unknown, refs = new Map<string, string>): string {
  if (schema == null) return 'z.any()';
  const s = schema as Record<string, any>;
  if ((s as any).$ref) {
    const ref = String((s as any).$ref).replace('#/components/schemas/', '');
    const refName = safeName(ref);
    return `${refName}`;
  }

  switch (schema.type) {
    case 'string':
      if (schema.enum) {
        return `z.enum([${schema.enum.map((v: string) => `"${String(v)}"`).join(', ')}] as const)`;
      }
      return 'z.string()';
    case 'number':
    case 'integer':
      return 'z.number()';
    case 'boolean':
      return 'z.boolean()';
    case 'array':
      return `z.array(${schemaToZod(name + 'Item', schema.items, components, refs)})`;
    case 'object': {
      const ss = s;
      if (!ss.properties) return 'z.record(z.any())';
      const props = Object.entries(ss.properties as Record<string, unknown>).map(([propName, propSchema]) => {
        const required = Array.isArray(ss.required) && ss.required.includes(propName);
        const z = schemaToZod(propName, propSchema, components, refs);
        return `  ${JSON.stringify(propName)}: ${required ? z : `${z}.optional()`}`;
      });
      return `z.object({\n${props.join(',\n')}\n})`;
    }
    default:
      if ((s as any).oneOf) {
        return `z.union([${((s as any).oneOf as any[]).map((sd) => schemaToZod(name, sd, components, refs)).join(', ')}])`;
      }
      if ((s as any).anyOf) {
        return `z.union([${((s as any).anyOf as any[]).map((sd) => schemaToZod(name, sd, components, refs)).join(', ')}])`;
      }
      return 'z.any()';
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function generate(doc: OpenAPIDoc) {
  const components = doc.components || {};
  const schemas = components.schemas || {};

  const lines: string[] = [];
  lines.push("// Auto-generated from docs da backend/openapi.json — do not edit manually");
  lines.push("import { z } from 'zod';\n");

  Object.entries(schemas).forEach(([key, value]) => {
    const name = safeName(key);
    try {
      const zodExp = schemaToZod(name, value, components);
      lines.push(`export const ${name} = ${zodExp};\n`);
    } catch {
      lines.push(`// failed to generate schema for ${key} - falling back to z.any()`);
      lines.push(`export const ${name} = z.any();\n`);
    }
  });

  lines.push('\nexport const schemas = {');
  Object.keys(schemas).forEach((k) => {
    lines.push(`  ${safeName(k)},`);
  });
  lines.push('} as const;\n');

  return lines.join('\n');
}

function main() {
  if (!fs.existsSync(input)) {
    console.error('OpenAPI JSON not found at', input);
    process.exit(1);
  }
  const raw = fs.readFileSync(input, 'utf-8');
  const doc = JSON.parse(raw);
  const out = generate(doc);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, out, 'utf-8');
  console.log('Wrote', outFile);
}

main();
