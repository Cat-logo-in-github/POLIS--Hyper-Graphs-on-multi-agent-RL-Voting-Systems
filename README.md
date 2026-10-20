# POLIS 4.0 — Society, forecasting and social choice

**Configure a miniature society, compare institutions, and inspect conditional forecasts with their evidence and limits.**

POLIS is a local browser research environment. V4 adds independent neural Q-learning, behavioral assumptions, ensemble forecasting, aggregate-data fitting with chronological validation, and a computational-social-choice laboratory. It preserves the topology studio, communities/geographies/metadata, scheduled interventions, exact checkpoints, recorded counterfactual replay and prior rule comparisons.

## Launch

Extract **POLIS-v4.0.zip**. The **POLIS-4.0** folder contains `index.html` at its root. Serve that folder using static hosting or a local HTTP server, then open its address. The app needs no account, API key, backend or remote runtime library. Browser ES modules/workers require HTTP; double-clicking `index.html` through `file://` may fail.

With Python installed, one local option is:

```
python -m http.server 8000
```

Then open `http://localhost:8000`. Node is needed only for optional development tests/batch research, not for the hosted app. The source includes a GitHub Pages workflow below.

## Start without specialist knowledge

The five main destinations are **Society model, Live lab, Forecast, Choice lab, Research**. Society workspaces reveal policy/behavior, interventions and comparison tools when relevant. Study files sit in one disclosure. The **Guided/Researcher** selector controls technical disclosures, and **?** opens contextual explanations with optional research detail.

1. Use **Run guided experiment** in Live lab. It pauses a real baseline at round 20. Select a group square and branch it; compare recorded futures after its removal.
2. In **Society model**, set communities, places, traits and policy alternatives. Generator changes rebuild agents; realized agent/group edits apply to the live society. The studio supports selected voter IDs, shift/box selection, membership edits, activation, deletion, randomization and undo/redo.
3. In **Policies & behavior**, choose sincere, random, stochastic logit, tabular Q or neural Q decisions. Expand technical parameters only when needed. Inspect actual action values, TD updates, replay/target statistics and neural loss in Live lab.
4. In **Forecast**, run an ensemble from fresh generators or an exact learned checkpoint. Vary explicit assumptions; inspect final-round winner frequencies and final-window outcome distributions. Simulation rounds have no built-in calendar interpretation.
5. Load the clearly labeled **synthetic demonstration** to learn fitting and validation, or import local aggregate observations. Training selects parameters; later observations and disjoint simulation seeds evaluate them beside a simple baseline. A fitted model can perform worse, and the UI reports that.
6. In **Compare voting rules**, set an objective before running. Compare three rules across any of five decision policies. Custom weights and a descriptive Pareto set expose tradeoffs. A tested candidate can be reproduced to its trained first-seed state in Live lab, inspected and checkpointed.
7. In **Choice lab**, choose a handbook chapter, edit its profile/matrix/claims and run. Each result links its question, precise method, limits and source. Export exact inputs and computed results.

A policy package is an alternative to elect; a voting rule aggregates ballots; an agent decision policy chooses a ballot. They are different research objects.

## What V4 implements

| Area | Executable capability |
| --- | --- |
| Society and studio | 12–600 actual agents, overlapping communities, abstract geography, metadata, individual traits/ideals, manual/dynamic groups, selection/editing/undo and preserved learned state. |
| Communication | Six topology modes: hypergraph, generated pairs, exact clique projection, degree-preserving randomized null, no-group ablation, dynamic groups. Five aggregators: linear, nonlinear, plurality, threshold consensus, no influence. Explicit incidence/communication constraints and mismatch diagnostics. |
| Behavioral models | Sincere, random and logit actions; editable temperature, private-information anchoring and confirmation gate; trust/confidence/noise/memory/diffusion assumptions. Neutral new controls preserve supported V3 transitions. |
| Learning | Independent tabular Q and independent small DQN agents; actual one-hot MLP gradients, Huber loss, recent replay, target copies and bounded traces. Continuing versus finite-horizon semantics remain explicit. |
| Forecasting | Up to 128 seeded runs, 500 future rounds, fixed/uniform/weighted-discrete assumptions, winner frequencies/MC errors, trajectory and endpoint quantiles, conditional checkpoint futures and exact protocol/CSV exports. |
| Calibration | Local aggregate CSV/JSON, explicit score-share semantics/provenance, up to two fit axes/25 candidates, chronological split, separate validation seeds, held-out numeric/probabilistic scores, persistence/frequency baseline and observed-versus-simulated plots. |
| Institutional studies | Three core rules × five decision policies; stated evaluation window, paired seed differences, competing metrics, user-weighted objective, descriptive nondominated set, exact first-seed trained inspection. |
| Theory laboratory | 19 editable representative handbook experiments, with bounded workers, exact/bounded status, visuals, small-input exhaustive algorithms and exports. |
| Reproducibility | Full learned checkpoints, independent A/B branches, actual retained historical states, divergence highlights, bounded sensitivity grids, reports, measured examples, tests and research-to-function mappings. |

The forecast work limit is 30,000 simulated rounds and six million agent updates per job. Detailed neural replay has a separate memory cap; very large networks/populations must reduce replay detail or use ensembles without retained frames. Representative population scaling changes illustrative counts only, never simulated sample size or precision. See the exact module limits before launching a study.

## What “forecast” and “optimal” mean

Without observation-based evaluation, the output is a **conditional scenario distribution**. Aggregate calibration is implemented, but no bundled empirical voter dataset, census model or live polling feed establishes its accuracy. Imported provenance is unverified. Serially dependent held-out rounds are weaker evidence than new independent elections. Simulation quantiles and Monte Carlo errors are not automatically calibrated real-world prediction intervals.

Neural agents learn from the numerical reward inside your model. They are not pretrained human voters. The best observed rule depends on the chosen objective, action/observation model, population, rewards, seeds, training horizon and evaluation window. A Pareto set of sample means does not establish an optimum under uncertainty. No perfect society simulation, universal optimum, MARL convergence, equilibrium or real-electorate forecast accuracy is claimed.

There is **one representative editable reconstruction per handbook chapter**, not every example, proof, algorithm or experiment in the 554-page book. Read the complete [coverage table](docs/handbook-coverage.md). Some algorithms are exact only within small caps; larger searches are bounded or rejected explicitly. The handbook PDF is linked, not redistributed.

## Research and methods

The Research notebook has source mappings with actual access notes and explicit non-reproduction boundaries. Selected primary readings include the [Handbook](https://procaccia.info/wp-content/uploads/2020/03/comsoc.pdf), [DQN](https://arxiv.org/abs/1312.5602), [MARL replay/nonstationarity](https://proceedings.mlr.press/v70/foerster17b.html), [election ABM forecasting](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0270194), [ABM calibration](https://arxiv.org/abs/1703.10639), [proper scoring](https://sites.stat.washington.edu/raftery/Research/PDF/Gneiting2007jasa.pdf), behavioral/opinion-dynamics studies and research on synthetic human samples. Mathematical models and published success elsewhere do not transfer predictive validity to POLIS.

Read [model.md](docs/model.md), [neural-notes.md](docs/neural-notes.md), [forecast-methods.md](docs/forecast-methods.md), [experiments.md](docs/experiments.md), [scenarios.md](docs/scenarios.md), [limitations.md](docs/limitations.md), [audit.md](docs/audit.md) and [verification.md](docs/verification.md). Actual example results and a printable HTML report are included. The saved synthetic calibration example deliberately includes a case where a simple baseline beats the fitted model.

## Files and compatibility

Settings JSON stores generators/parameters; importing creates fresh agents. Checkpoint JSON preserves realized traits, groups, pending transitions, online/target neural weights, replay, Q tables and retained histories. A recorded replay frame is inspection data, not a replacement full checkpoint. Save a full checkpoint before rebuilding. V2/V3 configurations/checkpoints migrate to V4; older semantics or new nonneutral controls can change continuation. V1 is not supported.

Forecast JSON stores complete assumptions, seeds, actual per-run outcomes and trajectories; fitted studies additionally store training/holdout data, candidates and scores. Handbook exports store exact inputs, method, limits and output. Files remain local unless you explicitly share them. No repository was changed or deployed for this delivery.

## Deploy to GitHub Pages

1. Extract the ZIP and back up your publishing repository.
2. Copy the **contents** of POLIS-4.0, including `.github`, into the static publishing repository. Preserve unrelated Python research code in the separate reference repository.
3. Commit/push to `main` (or update the workflow branch to your publishing branch).
4. In repository **Settings → Pages**, select **GitHub Actions**. The workflow runs tests/path checks, stages local assets and deploys without a website build.
5. Open your repository's Pages URL. Relative imports and all three worker URLs support repository subpaths.

The existing publishing address is [the POLIS Pages site](https://cat-logo-in-github.github.io/POLIS--Hyper-Graphs-on-multi-agent-RL-Voting-Systems/); it remains unchanged until you deploy. The separate Python [reference repository](https://github.com/Cat-logo-in-github/Hyper-Graphs-on-multi-agent-RL-Voting-Systems) has a different repository name/subpath.

## Optional researcher/developer checks

With Node 22+, no dependencies need installation:

```
node --test tests/*.test.js
node tests/check-package.js
node tests/repeated-study.js
```

The forecast-methods document includes a complete batch-study example. Versioned source, exact seed lists and exported protocols are needed for reproducibility. The MIT license covers this implementation; external publications retain their own rights.
