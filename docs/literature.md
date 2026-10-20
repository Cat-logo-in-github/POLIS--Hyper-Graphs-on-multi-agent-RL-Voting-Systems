> V4 reading guide: the in-app library contains 29 source mappings across 28 distinct source URLs (S13 and N3 refer to the same Foerster paper). The handbook, neural and forecast method notes describe the implemented pieces and their limits. Citations identify model inspirations, not empirical validation of POLIS.

# Literature, mechanism mapping and access notes

Reviewed 20 October 2026 against primary publication pages, author manuscripts and author repositories. “Full-text sections” means the identified sections were inspected, not every page. Abstract-only access is stated explicitly. Sources motivate transparent modeling choices; they do not calibrate defaults, validate electoral forecasts or establish novelty.

## S1 — Spatial preferences

Enelow & Hinich (eds., 1990). Advances in the Spatial Theory of Voting. Cambridge University Press. [Primary source](https://assets.cambridge.org/97805210/84536/excerpt/9780521084536_excerpt.pdf).

**Access:** Publisher excerpt front matter verified; substantive scanned pages unavailable in this review.

**Contribution and model boundary:** Spatial voting represents preferences in policy space. The specific POLIS utility formula and issue axes are author choices. This excerpt is retained as background, not substantive evidence for a particular utility equation.

**Implementation relevance:** Background for policy space. Squared distance, weights, benefits and clipping are explicit synthetic choices, not estimated human utility.

## S2 — Q-learning

Watkins & Dayan (1992). Machine Learning 8, 279–292. DOI: 10.1007/BF00992698. [Primary source](https://www.gatsby.ucl.ac.uk/~dayan/papers/cjch.pdf).

**Access:** Full-text update, task and convergence conditions reviewed.

**Contribution and model boundary:** The paper gives an incremental temporal-difference method and a convergence theorem under stated Markov, learning-rate and sampling conditions. POLIS uses the update as an inspectable baseline; no equilibrium or optimal policy follows from a stable reward chart.

**Implementation relevance:** Tabular update only. Coarse observations, fixed learning rate and changing co-learners do not inherit the stationary Markov convergence theorem.

## S3 — Complex Contagions and the Weakness of Long Ties

Centola & Macy (2007). American Journal of Sociology 113(3), 702–734. DOI: 10.1086/521848. [Primary source](https://ndg.asc.upenn.edu/wp-content/uploads/2016/04/Centola-Macy-2007-AJS.pdf).

**Access:** Full-text introduction and distinct-source mechanism reviewed.

**Contribution and model boundary:** The article distinguishes repeated exposure to one contact from activation requiring multiple distinct sources. A threshold of one available source does not by itself instantiate complex contagion. POLIS uses synthetic group gates rather than the published network experiment.

**Implementation relevance:** Motivates separating one-source and threshold transmission. POLIS fractional gates and signed offsets do not reproduce the lattice experiments.

## S4 — Opinion dynamics and bounded confidence

Hegselmann & Krause (2002). JASSS 5(3), 2. [Primary source](https://www.jasss.org/5/3/2.html).

**Access:** Abstract and full-text averaging/confidence sections reviewed.

**Contribution and model boundary:** The model studies continuous opinion averaging with confidence neighborhoods. POLIS gates a group signal using distance on its favorite component, rather than reproducing the original individual confidence neighborhood. The difference matters for claims about consensus and fragmentation.

**Implementation relevance:** Motivates confidence filtering. Recipient-to-group gating differs from original individual-neighbor averaging; inspect actual exposure changes.

## S5 — Timing matters when correcting fake news

Brashier et al. (2021). PNAS 118(5), e2020043118. DOI: 10.1073/pnas.2020043118. [Primary source](https://pubmed.ncbi.nlm.nih.gov/33495336/).

**Access:** Author abstract and indexed methods/discussion reviewed; direct PMC access returned a browser check.

**Contribution and model boundary:** The experiments compare timing of veracity information and later judgments of headline accuracy. POLIS provides schedules for injection, resistance and correction, but makes no correspondence between rounds and human memory. No empirical timing advantage is built into its results.

**Implementation relevance:** Motivates timing experiments. Synthetic offsets, resistance and memory are not fitted cognitive mechanisms or empirical effect sizes.

## S6 — The ODD Protocol: A Second Update

Grimm et al. (2020). JASSS 23(2), 7. DOI: 10.18564/jasss.4259. [Primary source](https://www.jasss.org/23/2/7.html).

**Access:** Full-text structure, scheduling and rationale guidance reviewed.

**Contribution and model boundary:** The protocol structures model descriptions around seven elements and calls for process order, rationale, evaluation and source correspondence. POLIS uses this organization in model.md and records experiment protocols separately. Compliance with a documentation format is not validation.

**Implementation relevance:** Structures model documentation and source correspondence. Documentation and reproducibility do not establish empirical validity.

## S7 — The spread of true and false news online

Vosoughi, Roy & Aral (2018). Science 359(6380), 1146–1151. DOI: 10.1126/science.aap9559. [Primary source](https://pubmed.ncbi.nlm.nih.gov/29590045/).

**Access:** Author abstract and metadata reviewed; publisher full text not reviewed.

**Contribution and model boundary:** The reported study compares diffusion of verified true and false stories on Twitter. That empirical setting motivates studying disruptions, but is distinct from numerical belief offsets and three-policy elections. No social-media dataset is ingested or reproduced.

**Implementation relevance:** Empirical motivation only. Twitter story diffusion neither calibrates utility offsets nor validates synthetic election outcomes.

## S8 — HYGMA: Dynamic grouping for MARL

Liu & Li (2025). ICML/PMLR 267, 38767–38788. [Primary source](https://proceedings.mlr.press/v267/liu25af.html).

**Access:** Proceedings abstract, metadata and official repository description reviewed; linked PDF unavailable.

**Contribution and model boundary:** HYGMA combines dynamic spectral clustering of state histories with hypergraph neural processing and attention in cooperative tasks. It motivates making grouping explicit. POLIS uses heuristic topology construction and independent tabular learners; it does not claim the learned architecture or benchmark results.

**Implementation relevance:** Clustering histories and neural hypergraph attention motivate explicit grouping assumptions. POLIS heuristic groups and tabular learners do not implement HYGMA.

## S9 — HyperComm: Coalition communication

Zhu et al. (2024). Neural Networks 178, 106432. DOI: 10.1016/j.neunet.2024.106432. [Primary source](https://pubmed.ncbi.nlm.nih.gov/38901092/).

**Access:** Author abstract, metadata and official repository README reviewed; publisher full text unavailable.

**Contribution and model boundary:** HyperComm uses coalition-aware hypergraph communication to address irrelevant information in cooperative multi-agent tasks. It motivates the separation of interaction structure from signal aggregation. A visible hyperedge alone does not constitute the published communication-learning method.

**Implementation relevance:** Motivates separating structure from communication. No learned embeddings, graph neural network or centralized training are implemented.

## S10 — Voting-Based MARL for Intelligent IoT

Xu et al. (2019; revised 2020). arXiv:1907.01385. [Primary source](https://arxiv.org/abs/1907.01385).

**Access:** Author abstract, introduction and objective description reviewed.

**Contribution and model boundary:** The method uses distributed primal-dual optimization for a globally averaged objective. Its use of voting in cooperative control differs from aggregation of heterogeneous political preferences. This distinction prevents importing its optimality and convergence claims into independent strategic voters.

**Implementation relevance:** Distributed primal-dual common-objective control differs from political preference aggregation. POLIS does not implement that algorithm or its guarantees.

## S11 — Configuration models of random hypergraphs

Chodrow (2020). Journal of Complex Networks 8(3), cnaa018. DOI: 10.1093/comnet/cnaa018; publisher lists a 2023 correction. [Primary source](https://arxiv.org/abs/1902.09302).

**Access:** Author/publisher abstracts and author software description reviewed; sampling proof and correction not reviewed.

**Contribution and model boundary:** The null models preserve node degree and hyperedge dimension sequences. Randomizing projected graphs can answer a different inference question. POLIS finite swaps preserve specified invariants but have no demonstrated sampling distribution or mixing guarantee. The publisher lists a 2023 correction whose content was not reviewed: https://doi.org/10.1093/comnet/cnad014.

**Implementation relevance:** Motivates preserving degree and edge-size sequences. Finite membership swaps here are heuristic nulls without uniformity or mixing guarantees.

## S12 — Computing the Margin of Victory for Various Voting Rules

Xia (2012). ACM EC, 982–999. DOI: 10.1145/2229012.2229086. [Primary source](https://econcs.seas.harvard.edu/resource/xiaec12pdf).

**Access:** Full-text abstract, rule definitions and margin-of-victory definition reviewed.

**Contribution and model boundary:** Margin of victory counts the fewest existing votes whose replacement changes the winner set, rather than simply measuring a score gap. POLIS bounds its enumeration and fixes tie handling. It does not implement every algorithm in the paper or election-audit risk guarantees.

**Implementation relevance:** Motivates existing-ballot replacement analysis. Exactness applies only after smaller counts are exhausted; bounded no-result is not a robustness proof.

## S13 — Independent learners and nonstationarity

Foerster et al. (2017). Stabilising Experience Replay for Deep Multi-Agent Reinforcement Learning. ICML/PMLR 70, 1146–1155. [Primary source](https://proceedings.mlr.press/v70/foerster17b.html).

**Access:** Proceedings abstract and metadata reviewed.

**Contribution and model boundary:** The paper addresses experience replay under changing co-learner policies. POLIS has no replay buffer, but the nonstationarity warning still applies to independent learners. Its learning diagnostics should be interpreted as measurements rather than proof of convergence.

**Implementation relevance:** Changing co-learners undermine stationary assumptions. POLIS V4 includes a small independent DQN with replay, but implements none of this paper’s replay corrections or fingerprints. See the expanded N3 access and implementation note in the V4 research library.

## S14 — Sensitivity analysis for agent-based models

ten Broeke, van Voorn & Ligtenberg (2016). JASSS 19(1), 5. DOI: 10.18564/jasss.2857. [Primary source](https://www.jasss.org/19/1/5.html).

**Access:** Abstract, introduction and sensitivity-method comparison reviewed.

**Contribution and model boundary:** Different sensitivity methods reveal different behavior in nonlinear agent models. POLIS parameter grids offer an exploratory starting point, without Sobol variance decomposition, global coverage or empirically fitted uncertainty. Report the sampled settings and avoid presenting the best displayed cell as an optimum.

**Implementation relevance:** Motivates repeated-seed parameter exploration. Bounded grids are not global variance decomposition, fitted uncertainty or an optimality certificate.

## Reading results responsibly

Keep literature claims narrower than the implemented mechanism. Report actual topology, aggregation, observation, reward, learner, schedule and seed design beside a result. Cite empirical papers for their actual studies; numeric outcomes here are synthetic model results. This selective review is not an exhaustive review of political theory, voter behavior or hypergraph MARL. The published methods above have not been reproduced or benchmarked by POLIS.

