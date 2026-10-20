# Literature and access notes

Reviewed 20 October 2026. Relevant sections or abstracts were read as stated below; no claim that every complete article was read. References motivate mechanisms, not calibrated defaults or exact replications.

## [S1] Spatial voting and policy preferences

Enelow & Hinich (eds., 1990), Advances in the Spatial Theory of Voting. Cambridge University Press.

Source: https://assets.cambridge.org/97805210/84536/excerpt/9780521084536_excerpt.pdf

Access: Publisher excerpt reviewed.

Implementation relevance: Motivates policy distance. POLIS chooses weighted squared distance; utilities are synthetic assumptions, not empirical estimates.

## [S2] Q-learning

Watkins & Dayan (1992). Machine Learning 8, 279–292. DOI: 10.1007/BF00992698.

Source: https://www.gatsby.ucl.ac.uk/~dayan/papers/cjch.pdf

Access: Full paper available; update and convergence assumptions reviewed.

Implementation relevance: Provides the tabular update. Coarse observations and evolving independent agents do not inherit stationary-MDP convergence guarantees.

## [S3] Complex Contagions and the Weakness of Long Ties

Centola & Macy (2007). American Journal of Sociology 113(3), 702–734. DOI: 10.1086/521848.

Source: https://ndg.asc.upenn.edu/wp-content/uploads/2016/04/Centola-Macy-2007-AJS.pdf

Access: Full paper available; simple/complex distinction and threshold model sections reviewed.

Implementation relevance: Motivates one-source versus threshold transmission. POLIS uses a fractional hyperedge gate, not a reproduction of the ring-lattice experiments.

## [S4] Opinion dynamics and bounded confidence: models, analysis and simulation

Hegselmann & Krause (2002). JASSS 5(3), article 2.

Source: https://www.jasss.org/5/3/2.html

Access: Publisher abstract reviewed.

Implementation relevance: Motivates influence restricted by belief distance. POLIS uses a group-level scalar gate rather than the original individual-neighbor averaging.

## [S5] Timing matters when correcting fake news

Brashier, Pennycook, Berinsky & Rand (2021). PNAS 118(5), e2020043118. DOI: 10.1073/pnas.2020043118.

Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC7865139/

Access: Methods, results and discussion reviewed from indexed full-text content; subsequent direct access encountered a browser check.

Implementation relevance: Motivates explicit correction timing. No empirical effect sizes or guaranteed timing advantage are encoded.

## [S6] The ODD Protocol: A Second Update

Grimm et al. (2020). JASSS 23(2), article 7. DOI: 10.18564/jasss.4259.

Source: https://doi.org/10.18564/jasss.4259

Access: Full article sections on structure, scheduling and rationale reviewed.

Implementation relevance: Informs model documentation and experiment protocols. Documentation is not empirical validation.

## [S7] The spread of true and false news online

Vosoughi, Roy & Aral (2018). Science 359(6380), 1146–1151. DOI: 10.1126/science.aap9559.

Source: https://pubmed.ncbi.nlm.nih.gov/29590045/

Access: Author abstract and metadata reviewed; publisher full text unavailable.

Implementation relevance: Empirical motivation for studying diffusion. Twitter story dynamics do not calibrate this numerical offset model.

## Prior hypergraph context

V1 verified the publisher landing page/abstract for Liu and Li, HYGMA (ICML 2025, PMLR 267:38767–38788), https://proceedings.mlr.press/v267/liu25af.html . POLIS does not reproduce its spectral grouping or neural methods. HyperComm (Neural Networks 178, 106432, 2024; DOI 10.1016/j.neunet.2024.106432) was verified through title/journal metadata; full text was inaccessible. No POLIS claim depends on its results.

## Evidence categories

Established methods: Q update, epsilon-greedy sampling, ballot scoring, spatial utility and threshold-model families. Design choices: specific clipped utility, trait distributions, observation bins, offset equations, network generator and rewards. Hypotheses: differences in topology, exposure or institutions may change outcomes. Model observations: recorded seed runs only. No finding is labelled a new empirical discovery.
