// validate.mjs — no dependencies. Every schema parses; the mock fixture and every golden case validate against in/out; manifests declare the six fields.
import { readFileSync, readdirSync, existsSync } from "node:fs";
const fail = (m) => { console.error("FAIL", m); process.exitCode = 1; };
function check(schema, v, path = "$") {
  if (schema.type) { const ts = [].concat(schema.type); const t = v === null ? "null" : Array.isArray(v) ? "array" : typeof v === "number" && Number.isInteger(v) && ts.includes("integer") ? "integer" : typeof v; if (!ts.includes(t)) return fail(`${path}: expected ${ts.join("|")}, got ${t}`); }
  if (schema.enum && !schema.enum.includes(v)) return fail(`${path}: ${JSON.stringify(v)} not in enum`);
  if (typeof v === "number") { if (schema.minimum !== undefined && v < schema.minimum) fail(`${path}: ${v} < ${schema.minimum}`); if (schema.maximum !== undefined && v > schema.maximum) fail(`${path}: ${v} > ${schema.maximum}`); }
  if (v && typeof v === "object" && !Array.isArray(v) && schema.properties) {
    for (const k of schema.required || []) if (!(k in v)) fail(`${path}: missing ${k}`);
    for (const [k, sv] of Object.entries(v)) { if (schema.properties[k]) check(schema.properties[k], sv, `${path}.${k}`); else if (schema.additionalProperties === false) fail(`${path}: unexpected ${k}`); }
  }
}
const mod = "voice-missed-booking";
const inS = JSON.parse(readFileSync(`${mod}/in.schema.json`, "utf8")), outS = JSON.parse(readFileSync(`${mod}/out.schema.json`, "utf8"));
const mock = JSON.parse(readFileSync(`${mod}/fixtures/mock_call.json`, "utf8")); check(inS, mock.in, "mock.in"); check(outS, mock.out, "mock.out");
const lines = readFileSync(`${mod}/eval/golden.jsonl`, "utf8").trim().split("\n"); let n = 0;
for (const l of lines) { const c = JSON.parse(l); check(inS, c.in, `${c.case}.in`); check(outS, c.out, `${c.case}.out`); const o = c.out.observations, d = c.out.decisions; const total = o.greeting_score + o.discovery_score + o.action_score + o.empathy_score; if (total !== d.total_score) fail(`${c.case}: total ${d.total_score} != ${total}`); n++; }
for (const f of ["rubric.yaml", "packet.yaml", "clock.yaml", "pricing.md"]) if (!existsSync(`${mod}/${f}`)) fail(`${mod}/${f} missing`);
for (const d of readdirSync(".", { withFileTypes: true }).filter((e) => e.isDirectory() && e.name !== mod && !e.name.startsWith(".") && e.name !== "tools")) {
  const m = readFileSync(`${d.name}/manifest.yaml`, "utf8"); for (const k of ["module:", "status:", "job:", "in:", "out:", "clock:", "substrate:", "packet:"]) if (!m.includes(k)) fail(`${d.name}/manifest.yaml lacks ${k}`);
}
console.log(process.exitCode ? "RED" : `GREEN · ${n} golden cases · mock fixture · 4 manifests`);
