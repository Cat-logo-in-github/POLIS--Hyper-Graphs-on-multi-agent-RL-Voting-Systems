# Study protocol

State your question before running. Choose an endpoint appropriate to that question and report the full configuration. The default endpoint is the arithmetic mean of each metric over every round in the run window, not the final round. Post-event/recovery analyses require exported round data and a separately specified analysis; the app does not imply that an endpoint captures all dynamics.

## Paired design

Fresh mode creates one baseline population per seed, clones all initial agent state, applies only the displayed treatment patch, then steps both. Baseline template overrides are explicit. Current metadata and generator definitions are used. Fresh studies do not include realized manual groups or edits; use snapshot mode for them.

Snapshot mode clones the current entire society, applies displayed baseline overrides, clones into B, then applies its treatment changes. Seeds alter future keyed randomness while keeping the same realized initial people. These are conditional futures, not independent population samples. Absolute event rounds at or before the snapshot's round are already past; schedule new future events or choose an event template, which schedules its injection relative to the snapshot.

Counter draws use seed, absolute round, identity and channel. Exposure also uses event ID. Thus an unrelated branch's skipped computations do not advance other mechanisms' streams. Different agent/population structures, changed event IDs, changed topology, policy-dependent observations and actions still produce different trajectories by design. Common random numbers improve design consistency, not causal identification outside the model.

## Available contrasts

- Pairwise → higher-order: identical agent preferences and scalar settings; group sizes and membership structures necessarily differ. This is not degree-matched isolation of interaction order. Inspect structure diagnostics before interpreting differences.
- No injection → false signal: baseline event schedule cleared; B receives an explicit C-policy injection.
- False signal → delayed correction: both branches share the same injection; B adds a later correction.
- Weak → strong influence.
- Less excluded → more excluded communication population.
- Sincere fixed policy → independent Q-learning (the decision rules differ by design).
- Custom: one named numerical parameter, up to five treatment values, each against the same baseline and matched seed list.

Limits: 1–12 seeds, 10–500 rounds per branch, up to 60 pairs. Jobs run in a module Web Worker, with progress and termination/cancellation. If worker construction is unavailable, the app can fall back to bounded main-thread batches. A worker initialization error is reported and requires another attempt or browser configuration change. No unfinished or failed run is labelled complete. Earlier completed pairs can be exported after cancellation.

## Report

Export question, baseline, patch, seeds, rounds, mode and endpoint; report paired means, sample SD and range of B−A differences. n=1 has no estimable sample variability. The app computes no confidence intervals, p-values or general superiority claims. Negative belief-error difference is improved accuracy in this model; a higher turnout or welfare difference does not establish democratic legitimacy or real-world causal effects.

The first seed/contrast gets aligned society snapshots, histories and actual event-start/end markers. Exported JSON includes first-pair trajectories and all pairs' endpoint means; CSV includes per-pair endpoints. For full trajectories of other seeds, replay the exported protocol with the public engine.

`node tests/repeated-study.js` records three eight-seed studies (42–49), 150 rounds per branch, 7,200 total simulation rounds. `docs/sample-results.json` is generated from actual engine results and preserves all settings. Those demonstrations are not evidence of empirical calibration or statistical significance.
