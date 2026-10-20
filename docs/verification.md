# V4 delivery verification

Performed 20 October 2026 against the V4 source and a fresh extraction of the release ZIP. This release extends the preserved V3 browser application. No repository push, public-site change or deployment was made.

## Automated verification

The final suite passes **173 tests, zero failures**, using `node --test tests/*.test.js`. All JavaScript modules are syntax checked. `tests/check-package.js` verifies local HTML/style/module/worker references, documentation/examples/workflow, version metadata and the absence of remote runtime scripts or node_modules. No dependency installation is required.

The tests cover original society/configuration/events/learning/checkpoint invariants; topology studio operations; matched communication constraints; actual historical frames and paired counterfactual replay; workload/cancellation bounds; structural failure and recovery; exact versus bounded ballot searches; report escaping and reproduction; rule comparisons and weighted/Pareto objectives. New tests verify DQN forward values, actual gradients/Huber loss, target copies, replay and legal actions; exact neural checkpoint continuation; preserving active tabular pending learning while resizing a dormant neural model; conditional learned-checkpoint forecasts; distribution assumptions; aggregate input validation; chronological fitting and disjoint-seed holdout scoring; neural replay memory limits; and all 19 representative handbook computations. Handbook tests include exhaustive small-profile Dodgson comparisons, claims conservation, matching stability, shrinking/growing ranking editors and label-preserving advanced inputs.

The delivered examples include migrated V4 settings, a neural society, synthetic aggregate observations, measured study results and a generated report. Test names retaining V3 identify preserved features, not obsolete release code.

## Actual measured examples

`tests/repeated-study.js` was executed against V4. Eight designs × six seeds (42–47) × 120 rounds × two branches produced **48 pairs / 11,520 branch-rounds**. These include hypergraph/clique, aggregation, degree-preserving null, learning horizon, sincere/Q, false-signal exposure, tabular/neural and neutral/behavioral contrasts. Three voting rules × five decision policies × three seeds × 100 rounds added **45 runs / 4,500 rounds**, evaluating the final 50 rounds. `docs/sample-results.json` stores the exact configurations, patches and measurements: **16,020 actual rounds**.

`docs/forecast-demo.json` records another **3,170 actual rounds**: 30 × 80 forecast rounds, 80 synthetic data-generation rounds and 690 fit/validation rounds. Eight observed timepoints are synthetic and explicitly labeled. The saved fitted model performs worse than the numeric persistence baseline on its holdout; this is reported, not concealed. Combined saved examples total **19,190 actual rounds**, excluding unit and browser fixtures. These are demonstrations, not empirical accuracy evidence or significant findings.

`docs/sample-report.html` contains an actual 12-agent, 20-round comparison, eight retained A/B frames, exact reproduction data and 29 source mappings (28 distinct URLs). The report generator's escaping and embedded data are tested.

## Browser checks actually performed

The application was served under `/POLIS-V4/`. A fresh release extraction was opened under `/verified-v4/POLIS-4.0/` to check relative paths and workers.

- Fresh load starts paused. Navigation, contextual help dialogs, Guided/Researcher disclosures and the 29 source mapping details were inspected. Researcher mode opens technical disclosures. No warning/error console entries were observed during checked V4 flows.
- Created a manual studio group from IDs 0,1,2,3; replaced it with 0,1,2; undo and redo restored the respective actual memberships.
- The guided experiment ran to actual round 20 and paused. Branch replay began with zero differing agents; the next frame at round 21 showed six differing agents after the selected group's removal. Both paths used recorded states.
- All 19 handbook default experiments completed through their worker. Edited the judgment example from Yes/Yes/No inconsistency to Yes/Yes/Yes consistency. Matching matrices were resized upward to four and downward from three to two; results had the corresponding complete assignment with zero blocking pairs. The final two-person case used three actual proposals.
- A fresh eight-run, 30-round conditional forecast with information-parameter uncertainty displayed actual winner frequencies, Monte Carlo uncertainty, trajectories and final-window distributions. A four-run continuation from an actual learned neural checkpoint was also exercised. Cancellation of a large forecast reported cancellation without presenting an unfinished study as complete.
- Synthetic aggregate data were loaded through the demo control and imported from the supplied JSON. The UI identified provenance as synthetic/unverified. A three-candidate fit with two training seeds displayed the earlier/later split, selected parameters, held-out error/probabilistic scores and baseline. A mismatched imported plurality rule against live Borda was rejected explicitly. The final UI also reports whether held-out aggregate error beat the simple baseline.
- Neural learning advanced actual rounds; the inspector showed recorded Q values, target/TD error, actual Huber loss, batch/replay statistics and a real loss plot. A reproduced trained Borda/neural benchmark candidate opened at round 20, then checkpoint/save/advance/restore returned the same visible neural inspector state.
- A three-rule × five-policy × two-seed benchmark completed 30 runs with a user-weighted objective and descriptive Pareto flags. A separate mobile neural benchmark completed three runs using 12 agents, ten rounds and a final-five-round endpoint.
- Browser-saved conditional-forecast and handbook-chapter JSON downloads were inspected for actual result/protocol contents. The report generator and included report are verified separately; a completed browser-saved HTML report download was not independently confirmed.
- Responsive checks at 390 × 844 inspected populated Lab, Choice, Forecast and rule-comparison pages. Document and viewport widths were both 375 CSS pixels (390 including scrollbar); wide result tables scroll within their containers.
- The release preview is an actual browser screenshot, also included as `docs/preview.jpg`.

## Interpretation and limits

Algorithmic and interface correctness does not establish model validity. POLIS has no bundled empirical electorate validation, pretrained human voters, guaranteed convergence, universal optimal rule or perfect society model. Aggregate provenance is unverified; dependent later rounds do not substitute for independent-election validation. Quantiles are simulation ranges conditional on assumptions, not automatically calibrated real-world intervals.

The handbook laboratory implements **one editable representative per chapter**, with exact/bounded variants and omissions documented in `handbook-coverage.md`. It does not implement every proof, example or algorithm in the book. Independent small DQN, explicit behavioral assumptions and bounded grid calibration are implemented; PPO/MAPPO/SAC, learned political adversaries, LLM personas and unrestricted neural world models are not. See `limitations.md` and each method note before drawing research claims.
