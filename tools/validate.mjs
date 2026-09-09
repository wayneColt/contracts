// validate.mjs — no dependencies. For every contract (a directory with in.schema.json): both schemas parse, every fixture and every golden case validate against in/out, the four prose files exist. For every declared module (a directory with manifest.yaml): the six fields are present.
import { readFileSync, readdirSync, existsSync } from "node:fs";
const fail = (m) => { console.error("FAIL", m); process.exitCode = 1; };
function check(schema, v, path = "$") {
  if (schema.type) { const ts = [].concat(schema.type); const t = v === null ? "null" : Array.isArray(v) ? "array" : typeof v === "number" && Number.isInteger(v) && ts.includes("integer") ? "integer" : typeof v; if (!ts.includes(t)) return fail(`${path}: expected ${ts.join("|")}, got ${t}`); }
  if (schema.enum && !schema.enum.includes(v)) return fail(`${path}: ${JSON.stringify(v)} not in enum`);
  if (typeof v === "number") { if (schema.minimum !== undefined && v < schema.minimum) fail(`${path}: ${v} < ${schema.minimum}`); if (schema.maximum !== undefined && v > schema.maximum) fail(`${path}: ${v} > ${schema.maximum}`); }
  if (Array.isArray(v) && schema.items) v.forEach((x, i) => check(schema.items, x, `${path}[${i}]`));
  if (v && typeof v === "object" && !Array.isArray(v) && schema.properties) {
    for (const k of schema.required || []) if (!(k in v)) fail(`${path}: missing ${k}`);
    for (const [k, sv] of Object.entries(v)) { if (schema.properties[k]) check(schema.properties[k], sv, `${path}.${k}`); else if (schema.additionalProperties === false) fail(`${path}: unexpected ${k}`); }
  }
}
const dirs = readdirSync(".", { withFileTypes: true }).filter((e) => e.isDirectory() && !e.name.startsWith(".") && !["tools", "docs", "node_modules"].includes(e.name)).map((e) => e.name);
let contracts = 0, declared = 0, golden = 0;
for (const mod of dirs) {
  if (existsSync(`${mod}/in.schema.json`)) {
    contracts++;
    const inS = JSON.parse(readFileSync(`${mod}/in.schema.json`, "utf8")), outS = JSON.parse(readFileSync(`${mod}/out.schema.json`, "utf8"));
    for (const f of readdirSync(`${mod}/fixtures`).filter((x) => x.endsWith(".json"))) { const m = JSON.parse(readFileSync(`${mod}/fixtures/${f}`, "utf8")); check(inS, m.in, `${mod}/${f}.in`); check(outS, m.out, `${mod}/${f}.out`); }
    for (const l of readFileSync(`${mod}/eval/golden.jsonl`, "utf8").trim().split("\n")) {
      const c = JSON.parse(l); check(inS, c.in, `${mod}/${c.case}.in`); check(outS, c.out, `${mod}/${c.case}.out`); golden++;
      const o = c.out.observations, d = c.out.decisions;
      if (o && "greeting_score" in o) { const total = o.greeting_score + o.discovery_score + o.action_score + o.empathy_score; if (total !== d.total_score) fail(`${mod}/${c.case}: total ${d.total_score} != ${total}`); }
      if (c.out.kind === "bay_diagnostic_recall" && c.out.hits) { if (c.out.returned !== c.out.hits.length) fail(`${mod}/${c.case}: returned ${c.out.returned} != ${c.out.hits.length}`); for (const h of c.out.hits) if (/\b[A-HJ-NPR-Z0-9]{17}\b|@|\d{3}[-. ]\d{3}[-. ]\d{4}/.test(h.note || "")) fail(`${mod}/${c.case}: unredacted note`); }
    }
    for (const f of ["rubric.yaml", "packet.yaml", "clock.yaml", "pricing.md"]) if (!existsSync(`${mod}/${f}`)) fail(`${mod}/${f} missing`);
  } else if (existsSync(`${mod}/manifest.yaml`)) {
    declared++;
    const m = readFileSync(`${mod}/manifest.yaml`, "utf8"); for (const k of ["module:", "status:", "job:", "in:", "out:", "clock:", "substrate:", "packet:"]) if (!m.includes(k)) fail(`${mod}/manifest.yaml lacks ${k}`);
  } else fail(`${mod}: neither a contract (in.schema.json) nor a declared module (manifest.yaml)`);
}
console.log(process.exitCode ? "RED" : `GREEN · ${contracts} contracts · ${golden} golden cases · ${declared} declared`);
