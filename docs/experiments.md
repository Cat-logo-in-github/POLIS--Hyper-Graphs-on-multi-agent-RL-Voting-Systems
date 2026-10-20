# V4.0 experiment protocol and interpretation

V4 adds [conditional forecasting and chronological validation](forecast-methods.md), [neural and behavioral mechanisms](neural-notes.md), and [handbook experiment coverage](handbook-coverage.md). Rule studies support five decision policies, normalized user-defined objective weights and a descriptive Pareto set across sample-mean welfare, community-floor welfare, turnout, regret and belief error. Regret/error enter a weighted objective as 1 minus the metric; all weights are nonnegative and normalized by their sum. Nondominance is descriptive, not uncertainty-adjusted optimality. “Inspect trained first seed” reruns that exact candidate and loads its real final learned state.


## Voting-rule benchmark

The **Compare voting rules** workspace generates fresh matched populations for plurality, approval and Borda, optionally crossed with sincere, logit, independent tabular/neural Q and random legal-action policies. Its endpoint is the explicitly chosen **final evaluation window**, unlike the paired-study full-window endpoint below. It ranks sample means for welfare, minimum nonempty-community mean welfare, regret, participation or belief error, reports per-seed SD and paired differences, and exports all measured trajectories. See [scenarios.md](scenarios.md) for exact objectives, recipe settings and interpretation. This is a bounded candidate comparison, not proof of an optimum. The cap is 8 seeds, 500 rounds, 30,000 candidate-rounds and 6 million agent updates; Q tables start at zero and convergence is not assumed.

State the research question, hypothesis, endpoint window and assumptions before running. The default endpoint is the arithmetic mean over **every actual round after the source checkpoint through the run's final round**, rather than the last round or only the post-event period. Endpoint choice can change a conclusion; export trajectories for separately specified event/recovery windows.

## Paired design and seed meaning

Fresh mode creates a baseline population for each seed, clones it, applies the treatment patch to B and steps the independent branches. Generator definitions and scalar settings are used. Manual groups, edited realized people and trained Q tables belong to checkpoints rather than fresh generator studies.

Checkpoint mode validates and deep-copies the full realized state, including people, topology, learned Q, pending transitions, schedules and calendar. Baseline overrides apply explicitly; treatment changes affect B only. A future-seed override is recorded and shared by A/B. Repeated future seeds hold the source population fixed, so they are conditional futures rather than independent generated populations.

Counter draws align seed, absolute round, identity and channel; exposure uses event identity. Skipping an unrelated operation does not advance another mechanism's random stream. This does not equate information exposure under different structures, prevent feedback divergence or establish real-world causal identification.

Absolute event starts at or before a checkpoint may already be past. Inspect the schedule and use future starts. The branch UI expresses delay relative to the checkpoint and converts it into an absolute start. Direct interventions occur before that round's information update/ballot.

## Topology, aggregation and matching contract

The central comparison is a source hypergraph against **its own clique expansion**, alongside independently generated pairwise, no-communication and randomized-membership controls. Keep aggregation, reward, learner, voting and population fixed unless they are the intended treatment.

The contract records actual starting configuration differences and topology diagnostics: population, active group sizes, incidence counts, components, isolation, potential contributions and current prospective admitted contribution counts. A group of size m can contribute m² source-to-recipient terms including self. One cached communication pass per simulated round enforces the cap; round histories record actual delivered counts. A diagnostic on a completed state is prospective, not a replacement for the history's actual count.

Matching strategies are limited:

| Strategy | Implemented control | Remaining limitation |
| --- | --- | --- |
| Population | Common cloned population and reported matching | Does not match incidence, size or delivered information. |
| Membership | Ordered incidence cap, truncating/omitting active generated groups when necessary | Equal cap does not guarantee equal realized incidence, coverage or degree sequence. |
| Communication | Cap accepted source contributions in deterministic group/recipient order | Zero is unlimited; different group sizes can leave unused budget or privilege earlier entries. |
| Group sizes | Declared comparison goal and actual size-distribution checks | Cannot force size-two pairwise groups to retain higher-order sizes. |

Clique projection retains one pair per source-group pair; duplicate pairs stay separate messages. It changes group sizes, incidence and nonlinear pooling. Linear aggregation is a useful mechanistic reference but does not automatically make graph and hypergraph dynamics equivalent, particularly with self-averaging, repeated pairs, confidence filters or diffusion gates.

The finite randomized null preserves group sizes and node incidence counts, including active-degree strata. It does not preserve every pair contact, community affinity or geometry, and is not a proven uniform configuration-model sampler (S11).

Warnings derive from changed configuration and measured structures. They identify mismatches in population, initial recorded agent state, group sizes, memberships, contributions, aggregation, rewards or voting, multiple changes and small seed counts. An empty warning list is not a scientific-validity badge. Check the actual saved state and parameter differences.

## Learners, rewards and periods

Sincere, random and independent Q policies share the same environment. Continuing mode bootstraps across reporting blocks. Finite-horizon mode uses terminal zero-bootstrap updates and a partial information reset before the next block while preserving demographics, topology and learned Q. Report the selected mode; a block length is not an innocuous plotting choice in finite-horizon mode.

Approval mean alignment and rank-weighted Borda alignment/conformity replace V2 max/mean assumptions. Report weights and the actual reward equation; welfare and reward are distinct endpoints. Q-value stability, low ballot switching or a plateau in average reward is not a convergence proof.

## Recorded checkpoint comparisons

The named-branch workspace runs independent A/B continuations and stores actual snapshots while they execute. Replay does not rerun from the latest state. Each retained frame has both populations, topology, beliefs, ballots, Q tables and current update traces at the same round. The timeline prioritizes event boundaries and supplements them with evenly spaced frames. The raw scalar metric trajectory includes every round.

Experiment frames are capped at 100 and further limited by a 1,500,000 Q-value recording budget divided across both branches and their agents. The export records retained and omitted rounds. Live history has a separate frame/memory cap described in model.md. A historical frame is for inspection; continue from a full final checkpoint to resume a branch.

The divergence inspector identifies differing agents/fields, winner changes, structure changes and welfare differences. A trace distinguishes direct group/event modifications, received information, belief updates, Q updates, ballot responses and the final election. These are model transitions rather than proof that one intermediate variable causally mediated the outcome.

## Descriptive variability

Per-seed B−A differences preserve pairing. Summary statistics include n, mean, sample SD, median, first/third quartile, interquartile range and range. Quartiles interpolate linearly at index (n−1)p. Sample SD is unavailable for n=1, rather than reported as evidence of zero uncertainty. The interface/report does not claim p-values, confidence intervals, significance or universal superiority.

Fresh population seeds and checkpoint conditional seeds answer different questions. Report which was used. A positive welfare difference is not a normative finding about legitimacy or fairness. A negative error difference means smaller numerical belief error in this model. Repeated parameter exploration is exploratory unless a protocol and comparison were prespecified.

The report's overall descriptive table can pool several patches/cells and explicitly labels that fact. Use per-patch/per-cell results for separate questions; a pooled mean across heterogeneous treatments is not one common treatment effect.

## Two-axis sensitivity grids

Each cell applies its two axis settings and repeats the selected seed list. The default **outcome** surface is the treatment branch's mean selected metric over all actual run rounds. With an empty treatment patch, A and B coincide; the grid still reveals variation across cell settings. An optional **effect** endpoint instead displays the paired treatment-minus-baseline difference, while a baseline endpoint displays the baseline mean. The saved protocol states the endpoint and its definition.

A cell click loads its exact measured configuration as a fresh Lab study, clearing histories and learned policies. Side-by-side cell inspection and exports retain settings, completed sample count, actual seed outcomes and variability. Comparisons pair common seed IDs; different population/generator settings can still leave realized starting conditions unmatched.

The UI uses conservative axis/seed/round limits and a requested step cap. The engine accepts up to seven values on each of two distinct whitelisted axes, at most 49 cells, 12 unique seeds, 500 rounds per branch and 50,000 total branch transitions; a further 6,000,000 agent-update cap bounds population×transitions. The requested total is cells×seeds×rounds×2. A lower user-selected cap takes precedence. Budget errors happen before the grid starts. Allowed axes and actual bounds are validated, not arbitrary imported property names.

A two-axis grid is not Sobol decomposition, a global sensitivity proof or empirical uncertainty quantification (S14). Export sampled settings and inspect omitted parameter space.

## Robustness failures and recovery

Supported synthetic structure failures disable selected/random/high-membership groups or disconnect selected/random agents. Disconnection removes communication memberships rather than removing a person from the election. A scheduled start changes B before that round. Optional duration restores the saved communication structure at the exclusive end; it does not reset beliefs or policies accumulated during the failure.

The module API runFailureContrast additionally measures operational recovery relative to the simultaneous baseline after the failure ends. Defaults use absolute welfare difference ≤0.02 for five consecutive actual rounds. The first qualifying round is the recovery start; the last round confirms the window. A missing qualifying window is “not observed by the endpoint,” not permanent damage. Recovery of welfare alone does not mean information, ballots or learned values recovered. This API is distinct from basic branch replay unless the interface explicitly displays a recovery definition.

## Ballot fragility

The analyzer studies the current **synthetic** ballot profile under its actual rule, availability of abstention and fixed tie handling. For a seeded tie, the current election's draw is held fixed rather than resampled between profiles. Replacements use legal plurality, approval or Borda actions; no new voter is added.

Deterministic enumeration searches increasing numbers of changed voters, then voter IDs and replacement actions. A witnessed change is an **exact minimum** only when every smaller changed-voter layer has been exhausted. Finding a witness does not require exhausting all profiles of the same size. A budget-limited result reports examined candidates and fully exhausted layers; “no change found” is not a general robustness certificate.

Defaults bound search to two replacements and 25,000 candidate profiles. Maximum supported bounds are three replacements, 100,000 examined profiles and 600 synthetic ballots. A no-result exhausted bound says only that no winner change exists within those legal replacement counts. Winner change includes to/from no winner when allowed. This is a limited margin-of-victory analysis inspired by S12, without a general voting-rule theorem or real-election audit guarantee.

## Computation, cancellation and export

The experiment modules bound pair runs to 1–1,000 rounds and validate seeds. UI controls are more conservative. Sweeps use a module Web Worker with progress; termination stops its actual work. The result format marks incomplete/cancelled/failed cells and retains completed data when returned. It never labels unfinished cells complete. Worker availability and browser memory remain practical constraints.

Exports include the environment version, question/hypothesis when supplied, exact configurations and patch, learner/reward/rule/aggregation, source checkpoint if needed, calendar, seed list, endpoint, starting contract, per-seed outcomes, actual trajectories and retained replay states. CSV exposes measured endpoints/cells; JSON preserves reproduction data. HTML reports embed escaped configuration/result data, a recorded first-run trajectory plot, confounders and primary-reference mappings when provided by the UI.

Reproduce with the same V4 source and exported protocol. Study protocols do not include a magically regenerated checkpoint: preserve the checkpoint embedded in conditional studies. Changing engine version or importing V2/V3 settings into V4 can change results. Development examples in tests/repeated-study.js and saved result files record actual executions; consult verification.md for the checks and demonstrations actually run.

