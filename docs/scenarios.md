# A practical path through the laboratory

POLIS asks which voting rule performs well **inside a chosen synthetic model**. It cannot identify a policy that is optimal for a real electorate. A voting rule (plurality, approval, Borda), an agent decision policy (sincere, random, logit, tabular or neural Q-learning) and a substantive policy package (A, B, C) are three different objects.

## First five minutes

Use **Run guided experiment** in Lab. It advances a 72-agent baseline to round 20 and pauses. Inspect a voter's numerical learning update. Select a square group center, then press the guided button again. Both futures continue from the same realized state; one loses that group. The synchronized slider shows actual retained states and measured agent differences. Return to Lab and use the topology studio to edit members and undo the change.

Use **Compare voting rules** to open the benchmark. Begin with sincere decisions and two or three seeds, then compare Q-learning and random actions. Choose the objective before looking at outcomes. Increase the horizon and seed count within the workload limits. Compare early and late evaluation windows rather than assuming training has converged.

## Hypothetical scenario recipes

| Scenario | Encoded assumptions | Useful comparison |
| --- | --- | --- |
| Participatory public budget | Default synthetic communities value public investment, ecological transition and redistribution differently; three editable policy packages. | Overall welfare versus least-served-community welfare; plurality versus full ranking. |
| Unequal ballot access | Two abstract regions have access multipliers 0.25 and 0.55; the remaining regions retain defaults. | Welfare, turnout and community welfare across the same generated people. Geography cohorts in Lab reveal participation differences. |
| Information shock and correction | Policy C receives a false numerical utility signal in rounds 25–54. Correction runs in rounds 65–89. | Compare windows before/during/after the shock. Use a paired no-injection/correction study to isolate its mechanisms. |
| Current Lab settings | Your generators, policy packages, topology, rewards, parameters and scheduled events. New agents are generated per seed. | Repeat a rule comparison under your assumptions. Checkpoint branches separately preserve manual edits and trained agents. |

Named recipes start from defaults rather than current customizations. Population is an explicit benchmark control. Seeds start from the current Lab seed. Event schedules use absolute rounds in these fresh runs; a short run may end before an event starts. No census, weather or election dataset is loaded.

## What does “best observed” mean?

The benchmark evaluates three voting rules, optionally crossed with three decision policies, on identical generated populations per seed. Q tables start at zero. Initial preferences and topology match; later actions and dynamic networks may diverge. Legal action spaces differ across rules. Sincere approval approves the single perceived favorite: one explicit approval strategy, not every possible sincere threshold.

Each candidate's endpoint is a mean over the **same final evaluation window**. Welfare/participation rank larger means first; regret/error rank smaller means first. Least-served-community welfare takes each nonempty community's mean true winner utility over that window, then the minimum across communities. Overlapping memberships count in each community. It is not a geographic or individual minimum. Welfare is zero when no policy wins.

The table shows competing outcomes together. Exact mean ties are listed together; near ties remain uncertain. Sample SD describes variation across seeds and is absent for n=1. Paired-seed differences use the first candidate as reference; a positive difference is an increase, whose desirability depends on the objective.

The ranking covers finite tested candidates. It does not prove optimality, solve a game equilibrium, learn a centralized planner or prove MARL convergence. Reward is not directly comparable across rules because ballot/conformity terms have rule-specific semantics. True welfare uses a common utility definition.

## A defensible research loop

1. Specify the question, objective, window and hypothesis before running.
2. Inspect mechanism equations and reward decomposition in Research and the model document.
3. Compare sincere/random baselines with Q-learning; vary reward weights and horizon, then inspect actual Q updates and exploration.
4. Separate aggregation from topology. Check realized degree, group size, incidence and communication budgets.
5. Repeat across seeds and nearby parameters. Heatmap cells contain measured values and completed run counts, not fitted confidence surfaces.
6. Inspect cohorts as descriptive diagnostics. Use conditional checkpoint branches for a specific intervention in one realized society.
7. Export JSON/CSV and the HTML report. Benchmark JSON includes exact settings, seeds, per-seed endpoints, community outcomes and round trajectories. Open a candidate fresh in Lab for inspection.

For a real-life application, a subsequent study must justify constructs, specify empirical calibration/validation, establish data provenance and consent, evaluate held-out outcomes and test measurement/model uncertainty. POLIS does not perform those steps. Spatial preferences, bounded confidence, complex contagion and independent Q-learning are research-informed abstractions rather than estimated voter psychology. See [literature.md](literature.md) for source mappings and access notes.

## V4 extensions

Forecast adds explicit ensemble uncertainty and a training/holdout workflow; see forecast-methods.md. The neural model learns simulated reward, not observed human behavior. Custom rule-objective weights are normalized; lower-is-better regret/error enter as one minus the metric. A nondominated sample-mean candidate can still be dominated under different seeds or model assumptions. Use the actual trained first-seed inspection to examine a chosen candidate rather than mistaking a fresh reset for trained behavior.
