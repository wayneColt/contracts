# Pricing footnotes · bay-diagnostic-recall
Written to be quoted verbatim.
1. **What the floor rests on.** No model runs. A question costs one edge invocation over the rows sent with it, which at published edge prices is a fraction of a cent per thousand questions. The floor is effectively zero; the price is for the standard, the redaction gate, and the comeback label, not for compute.
2. **What happens at the cap.** When a location exceeds its plan's monthly question allowance, questions answer `NO_SIGNAL` with a digest; a ranking is never truncated and presented as complete.
3. **What "under a tenth of a second" means.** 72.9 ms cold and 76.6 ms warm median, three samples, measured 2026-08-07 on the deployed runner at the edge. There is no live SKU because nothing waits on this module.
4. **What is retained and for how long.** Nothing. The module is stateless: the repair orders travel with the question and are discarded with the answer. Every note is redacted of VIN, phone and email before it is echoed. No repair order is ever stored.
5. **What is explicitly not included.** No diagnosis and no proposed cause: every hit is a repair order the technician opens and judges. No risk score: the comeback label is a pair to read, and below three hundred pairs the module refuses to fit a model to it. No dollar estimate: labor and parts are echoed as the export wrote them.
