export const sources=[
  {
    "id": "S1",
    "title": "Spatial preferences",
    "citation": "Enelow & Hinich (eds., 1990). Advances in the Spatial Theory of Voting. Cambridge University Press.",
    "url": "https://assets.cambridge.org/97805210/84536/excerpt/9780521084536_excerpt.pdf",
    "access": "Publisher excerpt front matter verified; substantive scanned pages unavailable in this review.",
    "use": "Background for policy space. Squared distance, weights, benefits and clipping are explicit synthetic choices, not estimated human utility."
  },
  {
    "id": "S2",
    "title": "Q-learning",
    "citation": "Watkins & Dayan (1992). Machine Learning 8, 279–292. DOI: 10.1007/BF00992698.",
    "url": "https://www.gatsby.ucl.ac.uk/~dayan/papers/cjch.pdf",
    "access": "Full-text update, task and convergence conditions reviewed.",
    "use": "Tabular update only. Coarse observations, fixed learning rate and changing co-learners do not inherit the stationary Markov convergence theorem."
  },
  {
    "id": "S3",
    "title": "Complex Contagions and the Weakness of Long Ties",
    "citation": "Centola & Macy (2007). American Journal of Sociology 113(3), 702–734. DOI: 10.1086/521848.",
    "url": "https://ndg.asc.upenn.edu/wp-content/uploads/2016/04/Centola-Macy-2007-AJS.pdf",
    "access": "Full-text introduction and distinct-source mechanism reviewed.",
    "use": "Motivates separating one-source and threshold transmission. POLIS fractional gates and signed offsets do not reproduce the lattice experiments."
  },
  {
    "id": "S4",
    "title": "Opinion dynamics and bounded confidence",
    "citation": "Hegselmann & Krause (2002). JASSS 5(3), 2.",
    "url": "https://www.jasss.org/5/3/2.html",
    "access": "Abstract and full-text averaging/confidence sections reviewed.",
    "use": "Motivates confidence filtering. Recipient-to-group gating differs from original individual-neighbor averaging; inspect actual exposure changes."
  },
  {
    "id": "S5",
    "title": "Timing matters when correcting fake news",
    "citation": "Brashier et al. (2021). PNAS 118(5), e2020043118. DOI: 10.1073/pnas.2020043118.",
    "url": "https://pubmed.ncbi.nlm.nih.gov/33495336/",
    "access": "Author abstract and indexed methods/discussion reviewed; direct PMC access returned a browser check.",
    "use": "Motivates timing experiments. Synthetic offsets, resistance and memory are not fitted cognitive mechanisms or empirical effect sizes."
  },
  {
    "id": "S6",
    "title": "The ODD Protocol: A Second Update",
    "citation": "Grimm et al. (2020). JASSS 23(2), 7. DOI: 10.18564/jasss.4259.",
    "url": "https://www.jasss.org/23/2/7.html",
    "access": "Full-text structure, scheduling and rationale guidance reviewed.",
    "use": "Structures model documentation and source correspondence. Documentation and reproducibility do not establish empirical validity."
  },
  {
    "id": "S7",
    "title": "The spread of true and false news online",
    "citation": "Vosoughi, Roy & Aral (2018). Science 359(6380), 1146–1151. DOI: 10.1126/science.aap9559.",
    "url": "https://pubmed.ncbi.nlm.nih.gov/29590045/",
    "access": "Author abstract and metadata reviewed; publisher full text not reviewed.",
    "use": "Empirical motivation only. Twitter story diffusion neither calibrates utility offsets nor validates synthetic election outcomes."
  },
  {
    "id": "S8",
    "title": "HYGMA: Dynamic grouping for MARL",
    "citation": "Liu & Li (2025). ICML/PMLR 267, 38767–38788.",
    "url": "https://proceedings.mlr.press/v267/liu25af.html",
    "access": "Proceedings abstract, metadata and official repository description reviewed; linked PDF unavailable.",
    "use": "Clustering histories and neural hypergraph attention motivate explicit grouping assumptions. POLIS heuristic groups and tabular learners do not implement HYGMA."
  },
  {
    "id": "S9",
    "title": "HyperComm: Coalition communication",
    "citation": "Zhu et al. (2024). Neural Networks 178, 106432. DOI: 10.1016/j.neunet.2024.106432.",
    "url": "https://pubmed.ncbi.nlm.nih.gov/38901092/",
    "access": "Author abstract, metadata and official repository README reviewed; publisher full text unavailable.",
    "use": "Motivates separating structure from communication. No learned embeddings, graph neural network or centralized training are implemented."
  },
  {
    "id": "S10",
    "title": "Voting-Based MARL for Intelligent IoT",
    "citation": "Xu et al. (2019; revised 2020). arXiv:1907.01385.",
    "url": "https://arxiv.org/abs/1907.01385",
    "access": "Author abstract, introduction and objective description reviewed.",
    "use": "Distributed primal-dual common-objective control differs from political preference aggregation. POLIS does not implement that algorithm or its guarantees."
  },
  {
    "id": "S11",
    "title": "Configuration models of random hypergraphs",
    "citation": "Chodrow (2020). Journal of Complex Networks 8(3), cnaa018. DOI: 10.1093/comnet/cnaa018; publisher lists a 2023 correction.",
    "url": "https://arxiv.org/abs/1902.09302",
    "access": "Author/publisher abstracts and author software description reviewed; sampling proof and correction not reviewed.",
    "use": "Motivates preserving degree and edge-size sequences. Finite membership swaps here are heuristic nulls without uniformity or mixing guarantees."
  },
  {
    "id": "S12",
    "title": "Computing the Margin of Victory for Various Voting Rules",
    "citation": "Xia (2012). ACM EC, 982–999. DOI: 10.1145/2229012.2229086.",
    "url": "https://econcs.seas.harvard.edu/resource/xiaec12pdf",
    "access": "Full-text abstract, rule definitions and margin-of-victory definition reviewed.",
    "use": "Motivates existing-ballot replacement analysis. Exactness applies only after smaller counts are exhausted; bounded no-result is not a robustness proof."
  },
  {
    "id": "S13",
    "title": "Independent learners and nonstationarity",
    "citation": "Foerster et al. (2017). Stabilising Experience Replay for Deep Multi-Agent Reinforcement Learning. ICML/PMLR 70, 1146–1155.",
    "url": "https://proceedings.mlr.press/v70/foerster17b.html",
    "access": "Proceedings abstract and metadata reviewed.",
    "use": "Changing co-learners undermine stationary assumptions. V4 adds a small independent replay learner; it implements none of the paper’s importance corrections or training fingerprints. See the more detailed N3 mapping."
  },
  {
    "id": "S14",
    "title": "Sensitivity analysis for agent-based models",
    "citation": "ten Broeke, van Voorn & Ligtenberg (2016). JASSS 19(1), 5. DOI: 10.18564/jasss.2857.",
    "url": "https://www.jasss.org/19/1/5.html",
    "access": "Abstract, introduction and sensitivity-method comparison reviewed.",
    "use": "Motivates repeated-seed parameter exploration. Bounded grids are not global variance decomposition, fitted uncertainty or an optimality certificate."
  }
];
export const modelHtml="<h3>From a miniature society to a research claim</h3><p>Ask a precise question before selecting a model: what mechanism could produce an outcome, which institution performs well under specified values, or how well can later observations be predicted? These questions need different evidence [H1,E2,E4,E5].</p><h3>Policy space and social communication [S1,S3,S4]</h3><pre>utility(i,k) = clipped weighted spatial proximity + regional benefit + active outcome shock\nobservation = perceived favorite × 6 + group favorite × 2 + utility-gap bin\nsocial signal = an explicitly selected aggregation over admitted interaction groups</pre><p>Communities, geographies, metadata, policy positions, traits, access and schedules are editable. Metadata has no intrinsic political effect. Topology and aggregation are independent controls; inspect realized memberships, group sizes, confidence gates and communication budgets. Six topology modes and five aggregation modes offer different assumptions.</p><h3>Decision policies and neural learning [S2,N1–N6]</h3><p>Compare sincere and random actions, stochastic logit decisions, tabular Q-learning and independent neural Q-learning. The neural model is an actual 18-input → hidden tanh → 8-output action-value network with replay and a copied target model. The inspector displays real predicted values, updates and loss. It is trained on simulated rewards, not human voting records. Co-learning actors, partial observations and a finite horizon prevent an optimality or convergence guarantee.</p><p>Stubbornness anchors private information; confirmation bias gates incompatible information; logit temperature controls stochastic decisions. Their equations and neutral defaults are in the neural notes. These are simplified theory-inspired mechanisms, not measured psychological coefficients or a solved quantal-response equilibrium.</p><h3>Forecast, calibration and validation [F1–F3]</h3><p>Forecast runs draw explicit seeds and, optionally, independent uniform or weighted-discrete parameter assumptions. The winner target is the final round; outcome metrics use a stated final window. Report simulated winner frequencies, Monte Carlo precision, trajectory quantiles and the actual sample count. Parameter ranges represent assumptions, not fitted Bayesian priors.</p><p>Local aggregate observations can be split chronologically. A bounded grid chooses parameters using training observations only, then disjoint simulation seeds evaluate the later holdout. MAE, Brier/log loss and a simple persistence/frequency baseline help assess the result. Serially dependent timepoints are not independent elections. Matching a history does not identify the true mechanism or guarantee future accuracy.</p><h3>Social choice and competing objectives [H1]</h3><p>The Choice lab provides original runnable examples mapped to every handbook chapter, including voting, allocation, matching, coalitions and judgment aggregation. Its coverage table states exact methods, input caps and omissions. Passing finite tests is not proof of a universal axiom. Small exact search is not a general complexity result. The benchmark ranks tested rule/decision-policy combinations for a chosen objective; editable weighted objectives and a descriptive Pareto set expose value tradeoffs.</p><h3>Reproducibility and evidence boundaries [S7,S12,S14,E1–E5]</h3><p>Full checkpoints preserve actual realized agents, groups, pending updates and learned neural/tabular state. Retained replay frames show recorded history rather than a reconstructed past. A settings export creates new agents from generators. Fresh seeds and checkpoint future seeds answer different questions. Reports distinguish assumed, synthetic, fitted and held-out quantities.</p><p>No perfect or complete voter simulation is claimed. There is no live electoral feed, census microdata model, LLM persona generator, centralized optimal planner or learned political adversary. Calibration is aggregate-data fitting with unverified local provenance. Use empirical validation, robustness checks and an independent test before interpreting a scenario projection as a useful forecast.</p><h3>Read the executable methods</h3><p><a href=\"./docs/scenarios.md\" target=\"_blank\">Study and objective guide</a> · <a href=\"./docs/model.md\" target=\"_blank\">Core model</a> · <a href=\"./docs/neural-notes.md\" target=\"_blank\">Neural and behavioral equations</a> · <a href=\"./docs/forecast-methods.md\" target=\"_blank\">Forecast methods</a> · <a href=\"./docs/handbook-coverage.md\" target=\"_blank\">Handbook coverage</a> · <a href=\"./docs/verification.md\" target=\"_blank\">Executed verification</a></p><h3>Sources and implementation mapping</h3>";
