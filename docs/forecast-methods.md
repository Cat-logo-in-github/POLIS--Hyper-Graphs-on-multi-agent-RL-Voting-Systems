# Conditional forecasting, calibration and validation in POLIS V4

This workspace distinguishes **a model-generated distribution**, **a fit to supplied aggregates**, and **descriptive later-timepoint evaluation**. None by itself establishes that an artificial society forecasts a real electorate. The engine has three substantive alternatives and a bounded number of actual agents; aggregate outcomes remain consequences of chosen mechanisms, preferences and institutions.

## What is implemented

`src/forecast.js` runs the actual society engine for distinct seeds, optionally from a complete checkpoint. `src/forecast-worker.js` keeps bounded jobs out of the interface thread. The UI displays final-winner probabilities, mean/quantile outcomes, trajectory bands, finite-run Monte Carlo error, provenance and full reproducibility exports. It supports fixed parameters, independent uniform assumptions, or discrete values with explicitly normalized nonnegative weights.

The separate calibration job evaluates a small user-defined parameter grid directly with the engine. It selects parameters on earlier aggregate observations only, then evaluates the selected combination on later observations using different simulation seeds. It reports competing simple baselines rather than assuming a complex model is useful.

These are implemented workflows, not renamed reproductions of a demographic election platform, Bayesian inference, XGBoost surrogate calibration or centralized MARL optimization. The rule benchmark separately compares finite candidate institutions and agent decision policies; a well-fitting model or high winner probability is not a social-welfare optimum.

## Origins, targets and ensembles

For fresh simulations the origin is round 0. Every seed generates a new population, topology and future random sequence from the selected generators. For checkpoint simulations, realized agents, metadata, groups, learned state, pending transitions and calendar are cloned; changing the seed changes future draws conditional on that one population. Past historical frames are omitted from the saved source checkpoint to control export size, while transition-relevant state remains. The original live state is not mutated.

The final-round winner has four mutually exclusive outcomes: A, B, C or none. Its simulated probability is the fraction of complete runs with that final outcome. This is different from the mean score share or welfare over the user-selected **final window**. For example, origin 20, horizon 50, window 10 means winner at round 70 and metric means over rounds 61–70. Event schedules retain their absolute rounds.

For plurality, score shares are shares of counted votes among participants. For approval and Borda they are shares of total rule scores. Approval share is not the fraction of voters approving an option; Borda share is not a vote-intention probability. Turnout is nonempty ballots divided by the simulated population. Welfare is true winner utility, with zero when no alternative wins. These definitions must match observed-data constructs.

For each metric, empirical quantiles interpolate at index `(n−1)p`, and sample SD uses denominator `n−1`. Monte Carlo SE of a mean is sample SD divided by `sqrt(n)`. Winner-frequency SE uses the same indicator-variable estimate, `sqrt(p(1−p)/(n−1))`; it is absent at n=1. A zero SE estimate at zero observed events does not establish impossibility. Thirty runs is a practical starting heuristic, not a validity guarantee. Rare outcomes and tail quantiles can require many more runs.

User-specified parameter distributions are sampled independently once per run using separate keyed random channels. They are assumptions, not an estimated posterior. Variation from parameters, population sampling and future randomness is mixed in that ensemble. There is no formal variance decomposition. Quantile shading represents this selected simulation distribution, not empirically calibrated prediction-interval coverage. Monte Carlo SE excludes model misspecification, data error, omitted mechanisms and uncertain real-world representativeness.

## Aggregate observations and provenance

Only aggregate records are accepted. The local browser importer reads CSV or JSON under 2 MB; nothing is uploaded. Unknown columns such as names, addresses or individual attributes are rejected. No personal voter table is part of this importer.

CSV example:

```csv
round,shareA,shareB,shareC,turnout,winner
10,0.40,0.35,0.25,0.75,A
20,0.38,0.37,0.25,0.73,A
30,0.34,0.40,0.26,0.74,B
40,0.35,0.39,0.26,0.76,B
```

These values illustrate the format; they are not measured election results. At least four distinct rounds and one numeric aggregate per row are required. Optional fields are welfare and winner. Shares must appear together and sum to one, or all be zero when no scores are counted. Scales are `[0,1]`, rounds are integers 1–500, and winner labels are A/B/C/none. Calendar time is not inferred from round numbers.

A JSON wrapper includes `rule`, `shareDefinition: "countedScore"`, `source`, `label` and `rows`. The rule must match the engine rule; plurality observations cannot be used to fit Borda score shares. The provenance labels are synthetic, user-supplied or empirical. An empirical label is a user assertion: provenance remains unverified. The bundled demonstration is generated by POLIS and always labeled synthetic. Fitting it teaches model recovery and validation mechanics; it is not evidence about people.

## Chronological selection and later-timepoint evaluation

1. Sort unique rounds and retain at least two early training rows and two later holdout rows. The training share is user-selected in `[0.4,0.8]`.
2. Evaluate at most two parameter axes and 25 combinations. Each candidate is simulated only through the last training round for each training seed. Predictions are seed means at the actual supplied rounds.
3. Choose the smallest mean squared error across all supplied numeric training fields/timepoints, weighting every observed scalar equally. Exact ties retain the first declared candidate. Winner labels do not select parameters.
4. Run only the selected parameters through the final holdout round using a disjoint seed set (default: training seeds plus 1,000,003 modulo 2³²). Score later observations without using them in parameter selection.

Mean absolute error and MSE use available numeric targets. Multiclass Brier loss is `sum_k(p_k−1{winner=k})²` over A/B/C/none. Log loss is `−log(p_observedWinner)` using natural logarithms. For categorical evaluation only, a symmetric one-count pseudocount gives `(count_k+1)/(n+4)`. Raw forecast frequencies remain unsmoothed. Missing winner labels mean no categorical score. Smaller losses are better.

The numeric naive baseline persists each field's last available training value. The categorical baseline uses smoothed training winner frequencies. Baseline counts are reported because a field absent in training cannot have a persistence baseline. Compare identical target coverage before comparing average losses. The model is not presumed to beat either baseline.

The fraction of held-out scalar observations inside simulated 5th–95th ranges is descriptive. Adjacent timepoints, repeated fields and winner classes are dependent; this is not independent-election accuracy or a future coverage certificate. Aggregate fit may be non-identifying: different mechanisms can yield similar outputs. Repeatedly changing a model after examining a holdout makes that holdout development data and requires a new untouched evaluation set. There is no automatic empirical acceptance threshold, calendar extrapolation, demographic effect learning or observation assimilation into individual agents.

## Practical limits and batch use

Forecasts allow 128 runs, horizons up to 500 rounds, six uncertain parameters, at most 30,000 total simulation rounds and six million agent updates. Calibration allows eight training seeds, eight disjoint validation seeds, 100 observations and 25 candidates under the same work caps. Invalid jobs are rejected before work begins. Cancelling a worker is marked incomplete; unfinished results are not shown as a completed study.

The represented-population field uniformly scales illustrative participant counts. If 72 agents are displayed as representing one million people, there are still only 72 interacting, learning agents. It does not add people, census/sample weights, generalization precision or an election model. Core engine bounds still apply.

Researchers can use the pure module from Node for repeatable, bounded batch studies without installing dependencies. For example, save the following beside the project root and run it as an ES module, or use `node --input-type=module` with stdin:

```js
import {writeFileSync} from 'node:fs';
import {runForecast} from './src/forecast.js';
const result = runForecast({
  config: {population: 72, learner: 'q', rule: 'plurality', recordFrames: false},
  seeds: Array.from({length: 40}, (_, i) => 1000 + i),
  rounds: 150, window: 30,
  parameters: [{key: 'influence', distribution: 'uniform', min: 0.1, max: 0.5}],
  representedPopulation: 72
});
writeFileSync('my-conditional-forecast.json', JSON.stringify(result, null, 2));
```

This is a complete finite study protocol, not an unbounded population-scale simulator. For a substantive research application, preregister outcomes, candidate mechanisms, data provenance, train/evaluation split and sensitivity checks; include alternative institutional rules and simple predictive baselines; report failures as well as favorable fits. Independent elections or genuinely new situations are a stronger evaluation than nearby points from one trajectory.

## Primary research reviewed and implementation boundaries

- **Gao et al. (2022), [Forecasting elections with agent-based modeling: Two live experiments](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0270194).** Introduction, model-screening methodology and reported live experiments/discussion were reviewed. Their use of historical model screening motivates separating fit from evaluation here. Their demographic platform, data and published accuracy are not reproduced or inherited by POLIS. The paper's success claims do not validate this model.
- **Lamperti, Roventini & Sani (2017/2018), [Agent-Based Model Calibration using Machine Learning Surrogates](https://arxiv.org/html/1703.10639v2).** Abstract and sections 2–3.2 were reviewed. It motivates treating calibration as a budgeted, validated search. POLIS evaluates each candidate with the actual engine; it does not reproduce the paper's XGBoost/active-learning surrogate, speedups or empirical applications.
- **Gneiting & Raftery (2007), [Strictly Proper Scoring Rules, Prediction, and Estimation](https://sites.stat.washington.edu/raftery/Research/PDF/Gneiting2007jasa.pdf).** Introduction, section 3 categorical scores and section 6 interval discussion were reviewed. Brier/logarithmic losses inform the implemented scoring. A sharp simulated distribution alone does not establish calibration. No published theorem is offered as a guarantee for this nonstationary social model.

## Executed module verification

The forecast-specific test suite passed 18/18 tests: actual endpoint calculations, deterministic replay, parameter support/weights, checkpoint immutability, quantiles/Monte Carlo errors/scaling, limits, cancellation, exports, strict aggregate imports, chronological/disjoint splits, actual fitting, no holdout-selection leakage, naive baselines, proper score fixtures and explicit synthetic provenance, extreme-weight normalization and logically consistent aggregate targets, V4 behavioral/neural assumptions and invalid-score rejection. Final integrated counts and browser checks belong in verification.md; this statement does not claim that every UI path or real-world forecasting task has been validated.

The included forecast-demo.json records an executed synthetic exercise. Its fitted model has a larger held-out MAE than the persistence baseline; that unfavorable comparison is retained. It demonstrates why adding calibration or neural learning is not itself evidence of forecasting skill.
