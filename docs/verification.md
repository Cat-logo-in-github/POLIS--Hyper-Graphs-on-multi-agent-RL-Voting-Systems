# V2 delivery verification

Performed 20 October 2026 on the final source package. No public deployment was performed.

## Automated engine verification

`node --test tests/engine.test.js`: **49 passed, 0 failed**.

Coverage includes keyed randomness and event identity; strict nested configuration validation; plurality/approval/full Borda, deterministic and seeded ties, all-abstain and malformed ballots; spatial utility; generator traits; hypergraph and dynamic-membership invariants; nonlinear group signals; isolated-agent behavior; confidence gating; simple/threshold/off diffusion; event windows and periodic coverage; intersecting community/region/metadata/resource/identity filters; false-signal isolation from true utility; removal, decay, correction and resistance; access/utility/blackout shocks; exact Q equation, delayed actual-next-state updates, terminal updates, fixed policies, exploration and rule resets; reward/welfare separation; exact checkpoint future replay and invalid checkpoint rejection; cohort metrics, entropy, episode return, regret; manual groups, overlapping memberships and geographic movement; paired and snapshot studies; summary and CSV behavior; population cap at 600.

All JavaScript modules and test scripts were syntax-checked. `node tests/check-package.js` verifies local HTML/CSS/module/worker references, required docs, examples and workflow. Every importable example is schema-validated. ZIP root, file listing, nonzero size and CRC integrity are checked after packaging.

## Actual repeated-seed measurements

`node tests/repeated-study.js`: three studies, eight seeds each (42–49), 150 rounds per branch: **24 pairs / 7,200 rounds**. Endpoints are full-window means. `sample-results.json` contains complete settings, explicit patches and all per-seed endpoint measurements. No outcome direction is assumed and no significance is claimed. The recorded examples should be regenerated if the engine is changed.

## Browser checks actually performed

Using the newly enabled in-app Browser against a local static server under `/POLIS-V2/`:

- App loads and advances real rounds; pause, single-step and +10 controls work. Navigation preserves state.
- Desktop viewport 1440×1000 and mobile viewport 390×844 inspected. Mobile document width remained within viewport; no horizontal page overflow in the inspected lab and intervention workspace. Full-page desktop screenshot inspected and saved. This is a bounded visual review, not an exhaustive cross-browser accessibility audit.
- Created **Research forum** community, increased its generator weight, created **Test district** region, added **network_role** metadata categories, saved and rebuilt. New selectors and cohort tables reflected those definitions.
- Scheduled a false signal for **Research forum AND network_role=low**, four rounds at full coverage. Preview matched 20/120 agents. Actual direct reach was 16.7%, with additional secondary distortion, and ledger showed exact start at round 1/end at round 5. This is a smoke-test observation, not a general diffusion estimate.
- Added a manual hyperedge, assigned an agent to overlapping communities and moved its abstract region. Inspector reflected both memberships and new geography.
- Edited a policy package name and confirmed the live election labels changed after application. Exercised approval and full-ranking Borda selectors and stepping.
- Numeric population control required explicit commit during browser automation. Added **Apply parameters**, retested an actual population change to 180 and live transmission-setting commit. Numeric global controls now require that explicit commit; selects and checkboxes apply on change.
- Downloaded a full checkpoint, advanced ten rounds, restored and confirmed return to the same saved round. Engine tests separately prove exact future replay, not just UI round restoration.
- Ran three-seed paired topology comparison, two-value/two-seed influence sweep (four pairs), and two-seed snapshot study. Worker progress, completed states, side-by-side plots and summaries appeared.
- Downloaded experiment JSON and study settings. Inspected actual files: completed sweep contained four per-pair results and exactly the requested treatment values; study preserved new generator definitions.
- Imported exported study; custom metadata cohorts appeared. Invalid population JSON was rejected with a clear message while the current study remained usable.
- Started a 12-seed/500-round worker job and cancelled it through the interface; status correctly reported cancellation with zero completed pairs.
- No warning/error console entries were observed during checked flows. Relative module/worker paths worked under the preview subpath. This is not a claim that every possible interaction or browser engine was tested.

## Verification limits

GitHub Actions was source-checked, not run on the user's repository. Browser-store denial, clipboard fallback, all worker failure modes, every preset/parameter combination, full keyboard/screen-reader coverage, and every permitted device/browser remain unverified. Engine tests cover the individual modeled interventions and invalid-input paths independently of UI smoke tests. No empirical calibration or behavioral prediction test was performed.
