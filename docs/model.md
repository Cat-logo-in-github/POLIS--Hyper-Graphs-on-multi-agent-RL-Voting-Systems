# POLIS V4.0 model — ODD-style description
V4 adds independent neural and logit decisions, anchoring/confirmation controls, ensemble forecasting and aggregate-data calibration/validation. The core transition equations below retain their neutral V3 behavior. Read [neural-notes.md](neural-notes.md) for exact added equations/state, [forecast-methods.md](forecast-methods.md) for fitting/uncertainty, and [handbook-coverage.md](handbook-coverage.md) for the separate theory laboratory. Neural online/target weights, replay and update statistics are part of learned state; tabular Q remains a separate representation.

Source correspondence: schema.js validates settings; topology.js constructs structure; engine.js defines agents, state transitions, learning and metrics; experiments.js defines paired studies and sweeps; robustness.js defines bounded ballot replacement analysis; view.js renders; advanced.js connects research controls. Source is the definitive implementation. References S1–S14 and actual access levels are in [literature.md](literature.md).

## 1. Purpose and patterns

The model explores whether changes in voting and learning follow from interaction order, connectivity, aggregation, information exposure or rewards. It supports transparent synthetic experiments and sensitivity checks. Evaluation uses mathematical fixtures, mechanism checks and deterministic replay; aggregate observations may be fitted through the separately documented Forecast module, but no empirical validity or novel scientific result is claimed by default. ODD organization follows S6 without implying validation.

## 2. Entities, state variables and scales

Agents have stable integer IDs, overlapping community memberships, an abstract region, three ideal positions in [-1,1], positive issue weights, trust, susceptibility, participation, resource, media exposure, categorical metadata, unit-square coordinates, true utility, beliefs, signed distortion, resistance, direct exposure counters, ballot/action, reward, lifetime return, an 18×8 Q table, pending transition, actual update history and current transition trace.

Exactly three policies have names and three issue positions. Communities are generators with relative sampling weight, ideals, issue salience, dispersion, trait means and optional home region. Initial memberships are exclusive, while realized memberships can overlap after editing. Membership affects structure and explicit event eligibility; it adds no identity-based utility bonus.

Regions define sampling weight, center coordinates, ballot access and policy-specific utility benefits. Metadata categories are initially independent uniform draws from authored values. Resource is a synthetic scalar with no inferred demographic meaning. Coordinates represent abstract space rather than a real map.

Groups have a stable ID, name, unique members, active flag and generated/manual status. Projected pairs retain their source-group ID. Events define mechanism, policy, signed intensity, window, period, coverage and intersecting filters.

One step is an election round, without an assumed mapping to days or real election cycles. Supported limits include 12–600 agents, three policies, three axes, 16 community generators, 12 regions, eight categorical factors and 40 scheduled events.

## 3. Process overview and scheduling

1. If the previous finite-horizon boundary ended, reset information state as described below. Determine events active at the next absolute round. Log their starts and exclusive ends.
2. Every ten rounds in dynamic topology, attempt degree-preserving swaps of generated group memberships. Form social signals and transmissible offsets from the old beliefs/distortions.
3. For each agent, recompute utility, decay resistance, evaluate periodic event coverage, accumulate false doses/corrections/access/outcome shocks, update distortion, then update belief. All agents read the same old group state.
4. Reuse the received old-state social signal alongside each agent's newly updated own belief to encode the actual observation. Apply a pending nonterminal Q update using that observation. Choose a legal action, construct its ballot and apply access failure if abstention is available. There is one simulated social communication pass per round.
5. Aggregate the election and compute true-utility reward components. A finite terminal transition updates immediately without bootstrap; otherwise the current state/action/reward waits for the next actual observation. Record metrics, event effects, traces and bounded state frames.

Rendering does not consume simulation randomness. Pausing, playback speed and changing views do not substitute for transitions. Event windows and finite boundaries use the absolute round, including after a checkpoint.

## 4. Design concepts

Emergence: winners, beliefs, diffusion and ballot changes arise from explicit transitions. Adaptation: independent tabular learners update their own tables; sincere and random policies are nonlearning controls. Objectives: authored reward weights below. Sensing: a coarse observation of private belief and group favorite, rather than every private ideal. Interaction: separately selected topology, aggregation and offset transmission. Heterogeneity: generator assumptions and sampled ideals/resources/metadata. Collectives: community labels and communication groups are distinct. Stochasticity: deterministic counter draws. Observation: state inspectors, Q traces, cohorts, recorded frames and paired experiments.

## 5. Initialization and topology

Sample a community using relative weights, then its home region or a weighted region. Sample each ideal uniformly within ±dispersion and clip. Copy salience and trait means; jitter resource by ±0.15 and coordinates by ±0.175, with bounds. Initialize utility from policy distance, beliefs equal utility, distortion/resistance zero and Q entries zero.

The generator excludes agents using a seeded isolation draw. Anchors appear at stride max(1, size−min(size−1, overlap)). Candidate ordering combines seeded randomness, homophily on the selected grouping criterion, and geographic distance. Grouping criteria are shared community, ideal-distance similarity, equality of most recent action, random affinity or manual-only. The action criterion is initially uninformative because all actions start at -1; regenerate after behavior exists to use it. Bridge draws can select another unused member. This is a heuristic affinity generator, not fitted social structure or HYGMA clustering.

Topology options:

- **None:** no generated communication groups.
- **Pairwise:** independently generated size-two groups using the same population and generator assumptions.
- **Hypergraph:** the generated groups at configured size.
- **Clique:** all unordered pairs within each exact source group. Parallel pairs from different source groups remain separate message incidences.
- **Randomized:** finite member swaps preserving group sizes and node incidence counts, subject to unique membership. Swaps remain within the same active/inactive group stratum, preserving active incidence degrees too. No uniform configuration-model or mixing claim is made.
- **Dynamic:** generated hyperedges periodically undergo the same finite membership swaps. Manual groups persist.

Membership matching applies an ordered incidence budget: groups/members can be truncated or omitted when the cap is exhausted. Communication matching caps accepted contributions per round in the single cached signal pass: a group of size m costs m contributions for each admitted recipient, including self, giving potential cost m². Accepted groups consume the budget in deterministic group/recipient order; this can privilege earlier entries. Zero budget means unconstrained. “Population” and “group sizes” record a matching goal; diagnostics show whether actual structural properties match. No strategy automatically equates every invariant.

Manual group changes, toggles and deletion modify actual state. A bounded topology undo/redo stack records topology edits rather than all agent/event/model edits. Save full checkpoints for exact branch points.

## 6. Input data and reproducibility

Inputs are authored settings and synthetic checkpoints. No external voter file, demographic service, empirical network, language model or runtime dataset is required.

Counter draws are keyed by seed, absolute round, agent/group identity, channel and slot. Event identity hashes select event-coverage channels. Removing an unrelated event does not advance a sequential RNG. Different structures can still change opportunities and outcomes. These draws are reproducibility devices, without an independence proof for every possible counter collision.

Version-2 and version-3 settings/checkpoints migrate into V4 with explicit new neutral defaults; resulting continuation uses V4 equations. Migration preserves supported stored state, not old engine semantics or numerical equivalence. Version-1 files remain incompatible.

## 7. Submodels

### True utility

For agent i and policy k:

`baseᵢ(k) = clip(1 − Σⱼwᵢⱼ(idealᵢⱼ−policyₖⱼ)²/(4Σⱼwᵢⱼ) + regionBenefitᵢ(k))`

`utilityᵢ(k) = clip(baseᵢ(k) + currentOutcomeShockᵢ(k))`

Clip is to [0,1]; clipping occurs before and after shocks. Policy positions, regional benefits and explicit outcome shocks change true utility. False information changes beliefs. S1 is background; this exact form and all parameters are synthetic choices.

### Social aggregation and confidence

Let μ(k) be the mean belief for policy k within a group, including the receiving agent. Normalize a nonnegative vector by its sum; all-zero vectors become [1/3,1/3,1/3].

- Linear: normalize μ.
- Nonlinear: normalize μ to the chosen positive amplification exponent, componentwise.
- Plurality: members split tied favorite votes equally; the group signal is equal mass over the maximal vote-count policies.
- Threshold: equal mass over policies whose fractional favorite support reaches the consensus threshold. If none qualify, the group provides no signal.
- None: no group contribution or group-based offset diffusion.

A recipient admits a group's signal if the absolute difference between its belief and the group mean on the group's favorite component is at most confidence. Admitted normalized signals are averaged and normalized again. If no signal is admitted, normalized own belief is the fallback. This fixes the V2 raw-fallback mismatch but still mixes normalized social vectors with raw utility-scale private evidence.

Confidence and both threshold controls are distinct: consensus threshold determines group policy signal; diffusion threshold determines outside-source distortion transmission. Topology none or aggregation none disables both group signals and group offset diffusion. Setting social influence to zero disables social belief mixing but does not separately disable offset diffusion.

### Signed offsets, evidence and belief

For each admitted recipient/group/policy, exclude the recipient from transmission sources. A source is active if its absolute offset exceeds 0.05. Simple mode gates if at least one outside source is active; threshold mode gates if the active fraction among outside members reaches the diffusion threshold; off mode gives zero. The transmitted value is the outside members' mean signed offset. Average over admitted groups. Opposite signs can cancel. The fractional threshold can be met by one outside source in small groups, so this need not implement multiple-source complex contagion.

`offsetNext = clip((oldOffset×(1−decay) + spread×groupOffset×susceptibility×(1−resistance) + directDose) × (1−correction), −1,1)`

A direct dose is signed intensity×trust×susceptibility×media×(1−resistance). Resistance decays by 1−decay/4; resistance events add abs(intensity)×trust and cap at 1. Correction amounts add abs(intensity)×trust and cap at 1. Event order matters when resistance and injection coincide.

`evidence = clip(utility + offsetNext + uniformNoise)`, where uniformNoise is in [-noise/2,noise/2].

`weight = influence×(1−blackout)`

`beliefNext = clip(memory×oldBelief + (1−memory)×((1−weight)×evidence + weight×oldGroupSignal))`

Blackout reduces social belief influence, not private evidence or independently defined offset diffusion. These are chosen numerical mechanisms inspired by S3–S5, not calibrated cognitive processes.

### Event semantics

Active window: start ≤ round < start+duration. Coverage attempts occur when (round−start) mod period = 0. Community, region, metadata equality, resource interval and optional ID set intersect with AND. Each eligible agent receives a keyed probability-of-coverage draw. Coverage is not an exact fraction.

Access shocks add signed intensity to regional access and clip. Utility shocks affect the selected policy on their actual exposure rounds; they are not permanent preference changes. Blackout is nonnegative and capped. Disabling an event stops new exposures; learned values, old distortion and memory can persist. The trace records coverage, applied dose, correction, resistance, shock, access, group input and resulting belief.

### Voting, observations and actions

Plurality has three candidate actions. Approval has seven nonempty masks. Borda has all six rankings scored 2/1/0. Optional abstention adds an eighth action at most. Invalid ballots are rejected. If all abstain, winner is null. Ties use smallest policy index or a seeded draw among tied policies. Score shares normalize counted scores, not electorate size.

Observation = 6×perceived favorite + 2×group favorite + gap bin, where gap bin is one when max(belief)−min(belief)>0.15. This gives 18 observations. They do not include every state variable or finite-horizon time-to-go.

Q policy uses epsilon-greedy choice with seeded tie draws and epsilon=max(floor, initial×decay^completedRounds). Sincere policy chooses perceived favorite, top-only approval or sincere complete ranking; it voluntarily abstains if its best belief is below voting cost. Random policy samples legal actions uniformly. All policies face the same information and structural access mechanisms.

A nonempty chosen ballot can be forced empty if a draw exceeds clip(turnout×participation×effectiveAccess). This structural access mechanism is active only when abstention is allowed. Its resulting reward is attributed to the chosen action.

### Reward and learning

Define ballotObjective(values, ballot) as zero for empty ballot; selected value for plurality; mean selected values for approval; and (2×first value + second value)/3 for Borda.

`reward = utilityReward×utility(winner) + ballotReward×ballotObjective(trueUtility) + conformityReward×ballotObjective(groupSignal) − votingCost×participated`

No winner gives outcome utility zero. Decomposition exposes weighted outcome, alignment, conformity and signed cost plus raw terms. The invariant inspector evaluates all legal ballots holding the realized winner fixed; outcome invariance there does not prove a ballot cannot change the winner. Approval mean alignment and Borda rank weights intentionally replace V2 max-over-ballot assumptions.

`Q(s,a) ← Q(s,a) + α[reward + γmaxQ(s′,legal a′) − Q(s,a)]`

Each Q agent has its own table with no parameter sharing. Nonterminal reward waits until the next actual observation; a trace records original action round, observation, reward, target, old/new Q, TD error and terminal flag.

Continuing mode never creates terminal transitions at reporting boundaries. Finite-horizon mode ends at absolute round multiples of episodeLength with zero bootstrap. Before the following step, utility is recomputed and beliefs reset to utility, distortion/resistance/direct-exposure state cleared, and ballots/actions/pending transitions cleared. Demographics, traits, topology, learned Q, lifetime return, reward history, absolute event calendar and global round persist. This is a defined partial environmental reset, not independent regenerated episodes. Changing rule/abstention clears incompatible Q values; learner/task/horizon edits clear pending transitions.

### Metrics, histories and inspection

Welfare is mean true utility of winner, zero with no winner. Best welfare is maximum mean utility among the three policies. Regret is their difference. Mean reward is separate. Reporting-block return sums mean rewards. Turnout is nonempty ballots/population. Error is mean absolute belief−utility over agents/policies. Distorted means any absolute offset >0.05. Direct reach means ever receiving a nonzero direct dose within the current information episode; zero-dose attempts are logged without increasing exposure counters; secondary diffusion is excluded. Dose is actual applied absolute injection dose. Disagreement counts agents whose true favorite differs from winner, or one for no winner. Entropy uses first ballot candidate plus abstention; approval's first entry is bookkeeping. Action changes count changed action IDs.

Metrics retain 3,000 rounds; event and change ledgers retain 500 entries; each agent keeps 80 updates/rewards. Live frames are bounded by min(frameLimit, floor(6000/population)), with frameLimit at most 120, plus a 12×1024²-character serialized-JSON retention budget keeping at least the current frame (string length, not a measured heap-memory limit). Frames retain actual full Q tables and latest trace but omit older agent update/reward histories and truncate metric/ledger tails. A same-round edit replaces that round's previous frame. Frames are inspection artifacts and cannot be restored as full checkpoints.

A full checkpoint includes realized people, Q tables, pending transitions, topology, schedules, round, histories and state. Independent clones branch without shared mutable objects. Experiment recording has a separate bounded frame budget and retains full round metrics; see [experiments.md](experiments.md). Traces reveal modeled transitions rather than identifying real-world causal mediation.



## Control-to-mechanism map

| Control family | Actual implementation and effect | Timing |
| --- | --- | --- |
| Population, seed, saved generators | create/validate sample a fresh realized society | Rebuild clears trained/history state. |
| Policy positions, region benefits | utilities computes true spatial outcome utility | Next transition, or immediate explicit agent edit. |
| Topology, grouping, size, overlap, affinity | buildTopology/generateGroups determine actual memberships | Applying parameters rebuilds groups while retaining agents/Q. |
| Selected group members/active/delete | editGroup/removeGroup/addGroup alter actual structure | Next transition; topology undo/redo is separate. |
| Aggregation/exponent/consensus threshold | aggregate determines normalized policy signal | Next cached communication pass. |
| Confidence and communication cap | groupSignals admits or skips recipient/group signals | Next round; fixed processing order matters. |
| Diffusion/spread/threshold/decay | groupSignals and step update signed offsets | Next round, separate from social belief influence. |
| Memory/noise/influence/blackout | step mixes private evidence and received social signal | Next information update. |
| Event window/period/filter/coverage | active/matches and keyed event draws determine actual exposure | Absolute scheduled rounds; disabling stops future effects. |
| Learner/exploration | choose selects sincere, random or epsilon-greedy action | Next ballot; learner edits clear pending transitions. |
| Alpha/gamma | applyLearning/qUpdate change actual tabular target/update | Next actual update. |
| Task mode/horizon | step/resetEpisode determine terminal target and reset | At absolute boundary; mode edits clear pending transition. |
| Rule/tie/abstention/cost/access | ballot/election/step define legal action, tally and participation | Next ballot; rule/abstention changes clear incompatible Q. |
| Reward weights | rewardComponents changes outcome/alignment/conformity terms | Next reward; does not directly alter utility. |
| Matching/seed/grid/endpoints | comparisonContract/runPair/planSweep define actual research job | When a new comparison starts. |
| Historical round/replay | frameAt and retained pairedFrames select recorded copies | Inspection only; does not step or mutate live agents. |

