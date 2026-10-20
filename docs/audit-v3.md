# V3.0 audit and scope decisions

Audit date: 20 October 2026. Input: the revised 31-page “AUTONOMOUS BUILD MISSION 2.0” PDF supplied for this review, the delivered POLIS V2.0 browser source, and public read-only inspection. The release is named V3.0 to follow the user's requested version.

## Provenance and actual baseline

The working application extends the delivered browser-native V2.0 source. It was preserved and inspected before changing modules. The existing automated baseline completed **49 tests, 49 passed** before V3 changes. Those tests establish the old executable baseline; they did not demonstrate the missing research controls.

The current deployment at [the POLIS Pages URL](https://cat-logo-in-github.github.io/POLIS--Hyper-Graphs-on-multi-agent-RL-Voting-Systems/) was opened read-only through the available browser. It displayed POLIS 2.0, a 120-agent default society, the existing controls and a progressing simulation.

The [reference repository](https://github.com/Cat-logo-in-github/Hyper-Graphs-on-multi-agent-RL-Voting-Systems) was also publicly readable. Its listing includes Python environment, SAC, policy and baseline files plus archived results; its README frames a six-agent, three-candidate course project. It is a separate source tree from the delivered static website. Selected remote source-file retrievals failed in the web reader. This audit therefore does not claim complete inspection of every Python algorithm or that those algorithms were ported, merged or reproduced. No remote commit, setting change or deployment was made.

## Scientific and interaction defects identified

| V2 observation from executable source | Why it matters | V3 response |
| --- | --- | --- |
| Group signals were normalized across policies, while isolated/confidence-rejected agents used unnormalized utility-scale beliefs. | Changing connectivity also changed signal scale, contaminating a topology comparison. | Normalize every signal and the fallback consistently; expose aggregation independently. |
| Pairwise versus hypergraph changed generated groups and size while always applying the same nonlinear cubic pooling. | Effects mixed topology, exposure, membership and nonlinearity. | Add no-communication, clique-expansion and randomized-membership baselines; retain linear aggregation and actual matching diagnostics. |
| Maximum utility among all Borda-ranked policies was identical for every full ranking; mean conformity was likewise invariant. | A displayed reward control could not distinguish ranking actions. | Replace the invariant term with rank-weighted alignment/conformity and show actual reward components; approval uses mean alignment. |
| Every episode block forced zero bootstrap although the society continued. | A logging boundary silently changed the learning objective. | Separate continuing-task and finite-horizon bootstrap semantics; label reporting blocks explicitly. |
| Offset diffusion included the receiving agent as a source. | Distortion could be reinforced without a distinct outside source. | Exclude the recipient from source counts/means; document signed cancellation and threshold assumptions. |
| The Q update used a pending transition, but the inspector did not record each actual update. | Users could see values without explaining which observation/reward changed them. | Preserve pending transitions and record update/decision/reward traces for the selected agent. |
| Checkpoints supported cloning, but visual comparison was sparse. | Reviewing the latest state could be mistaken for reviewing an earlier round. | Record bounded actual historical frames and compare independent checkpoint branches. |
| Template experiments reported paired endpoints without structural matching or parameter-difference inspection. | A numerical delta could conceal multiple changed assumptions. | Include actual configuration differences, topology diagnostics, seed semantics and confounder warnings. |
| The literature had seven references but omitted the requested hypergraph MARL and null-model boundaries. | Citation titles could imply methods not implemented. | Verify 14 primary-source mappings with access notes and explicit non-reproduction statements. |
| The README pointed to a different repository-subpath URL and claimed the reference repo was unavailable. | Deployment provenance and instructions were stale. | Correct the current Pages address and distinguish the Python reference from the static release. |

Final executed tests and browser observations belong in [verification.md](verification.md). An implementation response in this table is not a claim that a particular test passed.

## Priorities and deliberate reductions

The revised mission's central identification question is the organizing priority: can a structural effect be distinguished from aggregation, contact budget, exposure and reward? V3 completes bounded, inspectable versions of the core controls and comparisons. It does not claim that every pair of topologies can be perfectly matched or that a warning-free comparison proves causation beyond the model.

A learned adaptive adversary and learned defense were deferred. The release keeps explicit scheduled numerical interventions and robustness failures; it does not disguise a schedule as an adversarial RL policy. HYGMA, HyperComm and Voting-Based MARL are research context, not renamed implementations.

The source remains local browser JavaScript, with relative module and worker URLs, static assets and no remote runtime library. Node is an optional development test runner. The deployed application requires no Node, Python, build step, account, backend or key.

## Remaining review questions for a research study

Before drawing a conclusion, specify the estimand, endpoint window, learner, reward and intervention. Inspect residual contact/exposure differences; repeat over seed lists appropriate to fresh populations or conditional checkpoint futures; test alternative aggregation and reward assumptions. The model has no empirical calibration or representativeness claim. A complete executable experiment is different from a validated model of people.


