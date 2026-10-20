# POLIS V2 model — ODD-style description

Source correspondence: `schema.js` validates model inputs; `engine.js` defines agents and transitions; `experiments.js` implements paired studies; `worker.js` separates bounded research computation from the UI; `view.js` only renders engine state. Source code is the definitive implementation.

## 1. Purpose and patterns

Explore hypotheses about social topology, information persistence, institutional rules and adaptive ballot choice in an explicitly synthetic society. Evaluation uses deterministic mathematical fixtures, mechanism checks and reproducible seed experiments, not fitted human behavioral patterns. No empirical validity or new discovery is claimed. The ODD structure follows Grimm et al. (2020), reference S6; it does not confer validation.

## 2. Entities, state variables and scales

Agents: ID, overlapping community IDs, abstract region, three ideal positions in [-1,1], three positive issue weights, trust/susceptibility/participation/resource/media in [0,1], categorical metadata, abstract coordinates, true policy utilities, beliefs, misinformation offsets, resistance, exposure counters, action, ballot, reward, 18×8 Q table, pending nonterminal update and recent reward history.

Policies: exactly A/B/C, display names and three issue positions. Communities: generators with relative weights, ideal positions, issue salience, dispersion, behavioral-trait means and optional home region. Initial memberships are exclusive; realized membership can be edited to overlap. Community membership influences topology and exposure filters; it has no intrinsic identity-based utility bonus.

Regions: center coordinates, sampling weight, ballot access and policy-specific true utility benefits. Categorical attributes are sampled independently and uniformly from declared values; they have no built-in effect beyond explicitly selected filters. Resource is a synthetic scalar filter and descriptive cohort variable, not an inferred socioeconomic category. Geography is an abstract unit square, not a real map or residence database.

Hyperedges: unique agent members, active flag, stable ID and manual/generated flag. Events: ID, mechanism, affected policy, start, duration, period, signed intensity, per-period coverage probability, enabled flag, and intersecting eligibility filters.

One time step is one election round. No correspondence to days, media impressions or real election cycles is assumed. Histories retain 3,000 rounds, agent reward history 80 rounds, event ledger 500 entries.

## 3. Process overview and scheduling

1. Determine enabled events whose windows include round r. Log exact starts and exclusive ends. Dynamic topology attempts one unique-member replacement per generated hyperedge every ten rounds.
2. Form group signals and transmissible offsets from the previous round's beliefs and distortions.
3. For each agent: recompute true utility; decay resistance; evaluate eligible periodic event exposures; combine access shocks and true utility shocks; apply decay, group-offset transmission, new false signals and correction; update beliefs from evidence, noise, memory and group influence. These updates read old group state synchronously.
4. Form group signals from the new beliefs; discretize the actual current observation. Apply any previous pending nonterminal Q update using this observation as its actual next state. Select a legal action, generate ballot, then independently evaluate the ballot-access draw. Access failure forces an empty ballot if abstention is enabled.
5. Aggregate the election, calculate true outcome utility and each reward. Terminal rounds update Q with no bootstrap; other rounds store a pending state/action/reward to be updated at the next actual observation. Record metrics.

All observations, information and rewards derive from actual state. Rendering and UI speed never consume simulation draws. The society continues between episodes; only the bootstrap term and episode-return accumulator reset at boundaries. Information, policies, utilities and topology do not regenerate then.

## 4. Design concepts

Emergence: election winners, trajectories and diffusion arise from state transitions. Adaptation: independent tabular learners estimate action values; fixed-policy baseline votes sincerely. Objectives: reward below. Sensing: agents see only their coarse belief/group state, not all private ideal positions. Interaction: nonlinear whole-group aggregation and gated offset diffusion. Heterogeneity: explicit community generator assumptions and sampled ideals/resource/metadata. Collectives: overlapping communities and hyperedges are distinct. Observation: agent and cohort inspectors, metric exports and paired studies. Stochasticity: deterministic hash-based counter draws, not a sequential stream.

## 5. Initialization

Select a community by relative weight; choose its specified home region or a region by weight. Sample each ideal uniformly within ±dispersion of its community mean and clip. Copy issue salience and behavioral traits. Sample resource within ±0.15 of the mean and clip; media exposure is the community value. Metadata categories are uniform independent draws. Agent coordinates jitter ±0.175 around its region center and clip to [.02,.98]. Initialize beliefs to true utility, offsets/resistance to zero and Q entries to zero. Seeded random tie selection avoids all-zero policies always choosing A.

Generated group size is 2 in pairwise mode or configured group size otherwise. Anchors occur at stride max(1,size−min(size−1,overlap)) among agents not excluded by the isolation draw. Candidate ordering combines a keyed random score, same-community preference and geometric distance. Random bridges can replace a locally chosen candidate with a random unused one. This is a synthetic affinity-based generator, not a calibrated network model. Isolation excludes a fraction in expectation, not exactly; additional isolated agents can emerge because candidate selection does not guarantee coverage. Diagnostics report realized membership counts, sizes, incidence-connectivity components and isolation.

## 6. Input data

Only synthetic settings, locally generated checkpoints and user-authored numeric design assumptions. No external runtime dataset, voter roll, API, server, map or demographic lookup. V1 files are not schema-compatible with V2 and are rejected rather than silently reinterpreted.

## 7. Submodels

### True utility and belief

For agent i and policy k:

`baseUtility = clip(1 − Σ weight[j]×(ideal[j]−policy[k][j])² / (4×Σ weight[j]) + regionBenefit[k])`; then `utility = clip(baseUtility + currentTrueShock[k])`. The two clipping stages matter when a regional benefit already saturates utility.

This normalized weighted-squared-distance choice is inspired by spatial voting (S1). Ideal positions are invariant except explicit edits. Policy or benefit edits change outcome utility. False information cannot directly change true utility.

Within each eligible active hyperedge, compute the mean belief vector, cube its components and normalize across policies. Average signals across an agent's admitted groups. A group is admitted when the absolute difference between its mean and the agent's belief, evaluated on the group's favorite component, is ≤ confidence. Isolated/rejected agents fall back to their own belief vector. That fallback is not normalized and creates a scale difference from group signals; it is an explicit synthetic assumption, not an information-equivalence guarantee. Cubing a mean is a nonlinear whole-group operation, not fixed additive pairwise messages.

For offset diffusion, count distinct members with absolute offset >0.05 per policy. Simple mode gates transmission if any member meets that criterion; threshold mode gates if their fraction ≥ threshold; off mode gives zero. The transmitted value is the full group's mean offset. Self-membership is included. Confidence gates the group contribution to both social signals and distortion transmission. Contributions are averaged over admitted groups. These are higher-order group mechanisms, not the exact Centola–Macy or Hegselmann–Krause algorithms.

`offsetNext = clip((offset×(1−decay) + spread×groupOffset×susceptibility×(1−resistance) + newDose) × (1−correction), −1,1)`.

`newDose = intensity×trust×susceptibility×media×(1−resistance)` for the selected policy. A false signal can be positive or negative. Repeated signals accumulate and clip. Prebunk events add abs(intensity)×trust to resistance, capped at 1; resistance decays by `1−decay/4` each round. Event list order matters when same-round resistance and false injection coincide; schedule them separately for an unambiguous contrast. Correction fractions aggregate and cap at 1. Correction acts on offsets; belief memory can preserve prior impressions. This is not a cognitive model fitted to S5.

Evidence is clipped trueUtility + offset + uniform noise in [−noise/2,noise/2]. Belief is `memory×oldBelief + (1−memory)×((1−influence×(1−blackout))×evidence + influence×(1−blackout)×priorGroupSignal)`, clipped to [0,1]. Blackout reduces group influence, not independent observation or false injection.

### Events and targeting

Active window: `start ≤ round < start+duration`; exposure attempts occur when `(round−start) mod period = 0`. Each eligible agent gets an independent keyed coverage draw. Community, geography, metadata equality, resource interval and optional identity set are intersected with AND. Metadata and resource do not otherwise influence preferences or susceptibility automatically. Coverage is a probability per opportunity, not a guaranteed fraction. Event ID determines its random channel, so removing unrelated events does not shift coverage draws.

Access shocks add signed intensity to regional ballot access, then clip. Participation opportunity is `clip(turnout×agentParticipation×effectiveAccess)`. If abstention is disabled, access failures are intentionally disabled too. Utility shocks add signed policy utility during their active exposure rounds; regional benefits persist. When events stop, new effects stop, but policies and residual beliefs need not return to baseline.

### Voting and learning

Plurality: 3 candidate actions. Approval: 7 nonempty masks (a+1). Borda: all 6 rankings, scored 2/1/0. Optional abstention adds one action. Invalid ballots are rejected. If everyone abstains, winner is null. Ties use lowest index or a seeded lottery among tied candidates. Shares normalize total counted scores, not electorate size.

Observation = `6×perceivedFavorite + 2×groupFavorite + gapBin`, where gapBin=1 when max(belief)−min(belief)>0.15. This gives 18 states. Each agent learns independently using epsilon-greedy Q-learning (S2). Epsilon is max(floor,initial×decay^completedRounds). Nonterminal transitions are delayed until the next actual observation, so the latest reward can have a pending update visible in the inspector. Terminal transitions (round multiple of episodeLength) update immediately without bootstrap. Rule/abstention changes clear Q and pending transitions. Disabling learning clears pending transitions and prevents updates.

`reward = utilityReward×utility(winner) + ballotReward×max utility among ballot candidates + conformityReward×mean group signal over ballot candidates − votingCost×participated`.

No winner gives outcome utility 0. Empty ballots give no ballot or conformity reward and no voting cost. Under Borda the ballot contains all candidates, so those two reward components do not distinguish ranking actions; only collective outcome utility can do so. Approval's max term does not order approvals. Ballot-access failure assigns the resulting abstention reward to the chosen action. Fixed voters abstain voluntarily only if perceived best utility is below votingCost; otherwise they choose perceived favorite/top-only approval/full sincere ranking, then face the same structural access test.

### Metrics and bounds

Welfare = mean true utility for elected policy, zero for no winner. Regret = max candidate mean utility − realized welfare, not optimal joint policy regret. Mean reward is separate. Episode return sums mean rewards across its block. Turnout = nonempty ballots / population. Belief error = mean over agents and policies of absolute belief−trueUtility. Distorted = any absolute offset >0.05. Direct reach = ever directly injected, excluding indirect transmission. Disagreement = fraction whose true favorite differs from winner (1 when no winner). Entropy = Shannon entropy over first ballot candidate and abstention; first approval index is a bookkeeping convention. Action changes count actions, not full policy changes. Cohort means and support counts are descriptive; overlapping community totals can double-count people. No recovery-time metric, significance test or empirical forecast is computed.
