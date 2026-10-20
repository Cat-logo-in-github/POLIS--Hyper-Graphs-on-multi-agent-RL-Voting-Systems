# V4.0 limitations and interpretation

POLIS is an inspectable synthetic agent model for theory exploration. No default configuration is empirically calibrated to a population, survey, election, social platform or human cognitive experiment. Optional aggregate fitting and chronological validation do not by themselves establish predictive validity. A reproducible result establishes what these assumptions produced; it does not establish a prediction, human mechanism or general institutional ranking.

## Scientific scope

- Exactly three policy alternatives and three fixed issue axes. No multiwinner rule, agenda formation, coalition legislature, endogenous policy choice or electorate migration.
- The supported population is 12–600 synthetic agents. Communities, resources, categorical metadata and geography are authored variables, without demographic representativeness.
- Preferences follow one chosen spatial utility formula. Initial categorical metadata are uniform independent draws; community traits, ideals and geography are synthetic. Metadata have no inherent political or psychological meaning.
- True utility, perceived utility and Q rewards are distinct. A false signal is a signed numerical offset, not a natural-language message, source credibility model or demonstrated persuasion mechanism.
- Empirical references motivate questions. No HYGMA, HyperComm, Voting-Based MARL or human misinformation experiment is claimed as reproduced. There is no novelty claim from the selective literature review.

## Structural comparisons

A topology comparison can simultaneously alter degree, group size, repeated contacts, components, overlap and confidence-admitted information. Clique expansion preserves the pair occurrences induced by the base hyperedges, but replaces whole-group pooling with pair pooling. In particular, nonlinear aggregation and confidence gates can make those results differ even on a shared source hypergraph.

The randomized-membership null uses bounded swaps that preserve edge sizes and node incidence counts. It does not guarantee a uniform sample, adequate mixing, independence between null instances or preservation of all pairwise contacts, geography or community assortativity. It is not a complete configuration-model inference procedure.

Matching controls express a target and record diagnostics; they cannot make all structural invariants identical across all topologies. Remaining mismatches and configuration differences must accompany the effect estimate. Equal total communication opportunities do not guarantee equal independent information. No green “valid comparison” certification is justified.

## Information mechanisms

Social signals are normalized policy vectors whereas private evidence retains a utility scale. Consistent group/fallback normalization fixes the old connectivity-dependent scale mismatch; it does not remove every scale assumption in the belief equation.

Self-membership contributes to the group belief summary; recipient offsets are excluded from transmission-source counting. Signed false offsets can cancel when averaged. The fractional transmission threshold can be met by one outside source in a small group, so “threshold” is not automatically multiple-source complex contagion.

Confidence gating depends on one selected belief component rather than a full psychological distance. Susceptibility, resistance, trust and memory are numerical state variables. They have no fitted probability-of-belief interpretation. Repeated injections accumulate and clip; clipping can conceal incremental doses. Correction removes offsets while belief memory and learned behavior may persist.

Event filters intersect. Coverage is a per-opportunity probability and not an exact quota. Same-round resistance/injection order can matter; separate their schedules for an unambiguous timing comparison. Disabling or deleting an event prevents future effects rather than undoing past state.

## Learning and voting

Independent tabular Q-learning uses 18 coarse observations, up to eight legal actions, a finite training budget, a fixed learning rate and a decaying exploration schedule with a floor. Observations are not a sufficient state for a stationary Markov decision process. Other learners, network changes and interventions create nonstationarity. Convergence, optimality, a Nash equilibrium and strategic rationality are not guaranteed.

Continuing-task reporting blocks do not imply terminal states. Finite-horizon mode removes bootstrap at the boundary and resets information state before the next step: belief becomes current utility, distortion/resistance/exposure counters clear, and ballots/actions reset. Demographics, topology, learned Q tables, global round and absolute event calendar persist. The observation does not include time-to-go. Changing a voting rule or the availability of abstention clears incompatible Q tables.

A Borda ranking uses position-weighted alignment/conformity in V3. These reward assumptions differ from the action-invariant V2 max-over-ranking term, so old experiment numbers should not be compared as if only topology changed. Outcome utility is shared through the elected policy and is invariant across hypothetical ballots conditional on holding that outcome fixed. A chosen action may receive the reward of a forced abstention caused by access failure. This is the defined environment, not a causal credit-allocation guarantee.

“Fixed sincere” means choosing the current perceived favorite, top-only approval or perceived full ranking, subject to cost/access rules. It is not a human decision rule or a strategic best response. “Random” samples legal actions. Independent small DQN and logit policies are added in V4. No shared centralized critic, PPO, MAPPO, SAC, learned communications or empirically trained human voter model is implemented. Neural loss is training evidence, not human forecast accuracy.

## Metrics and uncertainty

Welfare means mean true utility of one elected policy and is zero for no winner. Regret compares with the best single available policy, not all possible policies or joint strategies. Reward, turnout, disagreement and entropy do not measure legitimacy, fairness, autonomy or democratic quality.

First-choice entropy includes abstention and uses a bookkeeping first candidate for approval; it is not information entropy of a human opinion distribution. Community cohorts can overlap and therefore double-count in sums. Direct reach excludes indirect diffusion. Offset prevalence uses a chosen 0.05 cutoff.

Fresh seeds vary generated populations. Checkpoint seeds vary futures conditional on the same realized population; they are not independent population samples. Paired seed differences quantify variation in the selected model experiment and endpoint, not empirical uncertainty about actual people. Small samples, parameter search and multiple comparisons require caution. A two-axis grid does not provide global sensitivity analysis or all interaction effects.

A robustness recovery criterion is an operational tolerance in welfare over consecutive rounds. It does not establish that beliefs, ballots, communities or policies recovered. Failure to recover within a run window is right-censored, not proof of permanent damage.

The ballot analyzer searches existing-ballot replacements under fixed tie handling. It distinguishes exhausted small-count searches, a witnessed exact minimum and a budget-limited result. A search limit or no witnessed change is not a proof of general robustness. It is not a recommendation for manipulating a real electorate.

## Deliberate omissions and practical bounds

The adaptive adversary and adaptive defense in the revised mission were deferred in favor of controlled core mechanisms, reproducible branches and inspectable traces. Scheduled synthetic disruptions are implemented; they are not trained adversarial policies.

Historical frames, Q-update traces, agent reward histories and event ledgers are bounded to control memory. A retained frame records actual state at that round; it is not every possible round and does not provide a continuous video. Live editing is not an unlimited automatic version-control system. Save a checkpoint before a destructive rebuild and export a protocol for reproducibility.

Web Workers support bounded experiments; cancellation retains completed pairs and marks the study incomplete. Browser speed and memory vary. No unmeasured performance target is promised. The core runs offline after local assets load, but the release does not install a service worker or promise that a previously unvisited Pages URL will load without a connection. Local ES modules require HTTP; opening index.html through file:// may fail.

No real voter file, private dataset, live social account, messaging service or text-generation system is required. The release performs no remote publishing on the user's behalf. Read [verification.md](verification.md) for the tests and browser checks actually executed, including any verification gaps.



## Rule benchmark interpretation

The benchmark compares finite candidate rules and decision policies under a selected objective and final evaluation window. Its best observed candidate is not a proven optimum. The least-served-community objective is the minimum of nonempty community window means; it does not measure individual or geographic fairness. Seed variability is descriptive, and changing the objective, candidate set, horizon, reward or generators can change a ranking. See scenarios.md.

## Forecast and handbook boundaries

Forecast distributions are conditional on model/configuration/parameter assumptions. Independent parameter draws omit correlations unless represented explicitly in separate scenarios. Chronological holdout timepoints may be dependent. A best grid point need not identify a mechanism. Counts scaled to a represented population create no additional agents or precision. MC errors and simulation quantiles do not capture unknown structural misspecification. See forecast-methods.md.

The Choice lab contains one bounded representative per handbook chapter, not every result, experiment or general domain in the book. Passing finite axiom checks is not a proof. Computation caps, exactness and deliberate variants are declared in handbook-coverage.md. The library cannot produce a perfect simulation or prove a universal optimal voting policy.
