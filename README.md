# Contracts

One contract per module. The module is the product; the buyer's own words are the packaging; the runner that composes modules is not in this repository and is not for sale.

A contract is five files and a footnote: `rubric.yaml` (the standard the buyer writes — the module does not run until it exists), `packet.yaml` (what is conserved, controllable, hidden and noise), `in.schema.json`, `out.schema.json`, `clock.yaml` (paused or live), a mock fixture, a golden eval set, and `pricing.md` written to be quoted verbatim.

## Modules

| Module | The job, in the buyer's words | In | Out | Clock | Status |
|---|---|---|---|---|---|
| [voice-missed-booking](voice-missed-booking/) | "did we miss a booking on the phone" | recording URL or SIP tap | grade, miss type, coaching note, next action | paused (nightly); **live is a separate SKU** | **contract complete · a runner exists** |
| [bay-diagnostic-recall](bay-diagnostic-recall/) | "what did we do the last time we saw this, and did the car come back" | the completed-repair-order export the shop already has + a symptom in the technician's words | ranked repair orders: what was done, category, note, flag hours, whether that vehicle came back | paused (answers when asked; **77 ms** measured) | **contract complete · a runner exists** |
| [recon-billed-vs-received](recon-billed-vs-received/) | "does what we were billed match what we got" | two document sets | matched lines, exceptions, dollar delta | paused | declared |
| [correspondence-answer-or-escalate](correspondence-answer-or-escalate/) | "answer what can be answered, escalate what can't" | mailbox or thread | classification, draft, escalation flag | paused with an SLA | declared |
| [document-fields-off-the-scan](document-fields-off-the-scan/) | "pull the fields off the scan and tie them to something" | PDF or scan set | extracted fields, cross-reference key | paused | declared |
| [books-categorize-and-file](books-categorize-and-file/) | "categorize it and hand me a filing packet" | transaction feed | categorized ledger, packet, open questions | paused | declared |

Every module except live Voice is a paused-clock module: it sleeps when there is nothing to do and is not billed while it sleeps.

## The constraint sentence

You cannot win a category. You can own a sentence that names constraints every incumbent violates. Voice's:

> grade every service call against *our* script, on the recordings we already have, without adding a second phone vendor, under $5 a location

Recall's:

> search our own completed repair orders by symptom and get back what we actually did and whether the car came back, from the export we already have, with no model in the loop, in under a tenth of a second

Each module is one such sentence. The other four are candidates until a runner has measured them.

## The exploded diagram
How the parts fit — the standard over the organs over the spine over the substrate — is drawn in [docs/EXPLODED_DIAGRAM.html](docs/EXPLODED_DIAGRAM.html).

## Rules that hold everywhere
- **Rung 0:** no standard, no run. A module refuses to grade against a rubric that has not been written.
- **Model observes, code decides.** Scores are observations; totals, outcomes and alerts are computed downstream and never asked of the model.
- **`NO_SIGNAL` over an estimate.** Dollar values come only from a real value column supplied by the buyer.
- **Retrieval over generation.** Where the buyer's own records can answer, the module returns the record, never a generated answer; every hit is a document the buyer can open.
- **Nothing sends outward until a human arms it.**
- **Disposability:** audio is transcribed and discarded; nothing is kept that the buyer did not ask to keep.

`tools/validate.mjs` checks every schema and every golden case; `tools/iceberg_check.sh` proves the tree names no client, store or person. MIT. `fabricated:false`
