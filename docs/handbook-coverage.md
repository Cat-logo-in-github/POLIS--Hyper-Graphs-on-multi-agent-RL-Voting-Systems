# Computational Social Choice laboratory: exact coverage

POLIS V4 includes **one editable representative experiment for each of 19 chapters**, not every example, theorem, algorithm, experimental study or research problem in the book. The chapter selector exposes the implemented scope and its limits before a run. There is no scientific basis for a finite application to claim that the whole field has been perfectly simulated.

Reference: Brandt, Conitzer, Endriss, Lang & Procaccia (eds.), *Handbook of Computational Social Choice*, Cambridge University Press (2016), DOI [10.1017/CBO9781107446984](https://doi.org/10.1017/CBO9781107446984). The [author-hosted PDF](https://procaccia.info/wp-content/uploads/2020/03/comsoc.pdf) was accessible as a 554-page file. The [publisher record](https://www.cambridge.org/core/books/handbook-of-computational-social-choice/8AF63E87F76A5FC974D5E73536C52BD6) and contents establish the chapter structure. The book is linked rather than bundled or reproduced.

## Reading and provenance

Reviewed on 20 October 2026: contents, introductory framing, and selected substantive definitions/algorithm sections relevant to the implementations below. Particular checks included the distinction between strict Dodgson and weak Young targets; the Kemeny agreement/distance objective; Mallows likelihood assumptions; possible versus necessary co-winners; the top-cycle extension with majority ties; two-agent cut-and-choose; deferred acceptance; additive hedonic stability; Banzhaf/Shapley–Shubik definitions; conjunction judgment aggregation; the chapter’s undamped PageRank versus this implementation’s damped variant; and deterministic balanced-bracket agenda enumeration. This is not a claim that every page, proof, reference or empirical result in the handbook was read or replicated.

Chapter 11’s explicitly ordinal framing was respected: its representative uses claims-allocation rules rather than presenting cardinal utility maximization as that chapter’s method. Additive goods utilities appear separately in Chapter 12.

## Implemented chapter experiments

| Chapter and relevant sections | Executable reconstruction | Deliberate omissions / bounds |
| --- | --- | --- |
| 1, §§1.1–1.3 | A common ranked profile is evaluated by multiple rules. | Introductory example, not a general impossibility proof. |
| 2, §§2.2–2.4, 2.7, 2.10 | Plurality, Borda, veto, top-K approval, Copeland, maximin, IRV, Schulze; Pareto/Condorcet profile checks. | A finite witness is distinguished from universal axiom satisfaction. |
| 3, §§3.2–3.3, 3.5 | Pairwise majority graph, majority cycles, weak-majority top-cycle reachability and comparison rules. | Banks, bipartisan, minimal-covering and tournament-equilibrium sets are not implemented. |
| 4, §§4.1–4.2 | Exact Kemeny consensus rankings and all candidates topping optimal rankings. | At most seven alternatives / 5,040 rankings; no polynomial-time claim. |
| 5, §§5.2, 5.5 | Young minimum voter deletions to weak Condorcet status; Dodgson minimum adjacent exchanges to strict Condorcet status. | Young ≤14 voters/six alternatives. Dodgson ≤20/six, ≤50,000 deficit states per candidate. StrongYoung and approximation algorithms omitted. |
| 6, §§6.2–6.4 | Beneficial single-voter report search against original strict preferences. | ≤80 voters/six alternatives/50,000 reports; no coalitional/Bayesian strategic model or universal strategyproofness certification. |
| 7, §§7.2–7.3 | Constructive control by deleting up to three voters. | ≤120 voters/six alternatives/50,000 profiles. Other control models and bribery variants are not implemented. |
| 8, §§8.2–8.3 | Independent Mallows ranking likelihood, uniform-prior consensus mass and maximum-likelihood/Kemeny comparison. | Common dispersion, ≤seven alternatives. Not an empirical voter posterior or all distance-rationalizable rules. |
| 9, §§9.2, 9.4 | Simultaneous versus X-then-Y sequential voting on two binary issues with explicit bundle utilities. | Four bundles, ≤1,000 voters. No general CP-nets, combinatorial language or multiwinner algorithm. |
| 10, §§10.2–10.3, 10.5 | Exact completion of ordered ranking prefixes, possible/necessary co-winner sets. | ≤six alternatives/20 ballots/20,000 completions. No optimal elicitation or general partial-order solver. |
| 11, §§11.2–11.4 | Proportional, constrained equal awards, constrained equal losses and Talmud claims rules. | A claims-problem specialization. No full ordinal economy, exchange, consistency-characterization or welfare theorem solver. |
| 12, §§12.1–12.4 | Exhaustive additive goods assignments; utilitarian, normalized maximin and plain Nash-product selections; envy/proportional/EF1 diagnostics. | Two to six agents, ≤12 goods, ≤200,000 assignments. No general nonadditive allocation or guarantee that an arbitrary zero-product Nash tie is EF1. |
| 13, §§13.2–13.3.1 | Exact two-agent cut-and-choose for nonnegative piecewise-constant densities. | Two agents / ≤50 equal-length density bins. No general multi-agent envy-free cake division. |
| 14, §14.2 | One-to-one deferred acceptance with complete strict lists, actual proposal trace and blocking-pair check. | Equal side sizes ≤100 (simple editor ≤10); no ties, capacities, couples or incomplete lists. |
| 15, §§15.1–15.3 | All additive hedonic partitions, Nash-stability and strict core-blocking tests. | Two to seven agents. Stability is not guaranteed to exist; other representations/notions omitted. |
| 16, §§16.2, 16.4 | Exact absolute/normalized Banzhaf and Shapley–Shubik pivotal power. | ≤16 voters. Null games have zero power; coalition likelihood assumptions are explicit. No nucleolus/core solver. |
| 17, §§17.2–17.3 | Proposition-wise majority, premise aggregation and Hamming-distance consistent outcomes. | Agenda A, B, A∧B only. Not arbitrary propositional reasoning or an impossibility-proof engine. |
| 18, §18.2 | Damped PageRank with uniform teleportation/dangling-node handling and numerical convergence diagnostics. | Practical variant of the chapter’s undamped strongly-connected model. Other recommendation/referral mechanisms and axiomatic characterizations omitted. |
| 19, §§19.1–19.3 | Balanced knockout play and exhaustive seeding reachability. | Two/four/eight alternatives, ≤40,320 seedings; deterministic matches, no arbitrary tree or probabilistic tournament optimizer. |

## Inputs, outputs and reproducibility

Ranked profiles use complete strict orders over two to eight abstract alternatives and at most 2,000 ballots. Users can import the live society’s utility or belief rankings into these static experiments, without changing the society. Tied utilities are ordered by alternative ID. The profile editor compresses identical rankings as `count: A > B > C`. Approval in this laboratory is explicit top-K approval; it is not an unrestricted approval-ballot input model.

Value, endorsement, judgment, matching and density matrices have simple editable cells; structured JSON exposes exact parameters and supports larger allowed inputs. All experiments run in an isolated worker. Cancellation terminates that computation and does not present an unfinished result as complete. Errors or exact-search caps are visible rather than fabricated zero results.

Exports contain exact inputs, chapter/section citation, model bounds and the same numerical object used to draw the visual. The book’s chapter labels are navigation and provenance, not validation certificates. Most provided examples are original small fixtures; the classic small Dodgson/Young score checks are used as algorithm verification rather than claimed empirical reproductions.

The same profile may have multiple co-winners. Scoring and consensus results retain those sets. IRV has an explicit ID-based elimination tie rule; strategic/deletion searches select the lowest-ID co-winner. Knockout pairwise ties select the lower ID. These conventions can affect outcomes and are recorded in results.

Exact allocation, preference-completion and bracket counts are **not forecast probabilities**. The Mallows consensus distribution is probabilistic only conditional on its chosen noise model and uniform prior. Normative choices about aggregation, fairness and power are separate from empirical forecasting and dynamic MARL behavior.

## Executed verification

`node --test tests/choice.test.js` checks all 19 default chapter runs plus voting fixtures, Kemeny/Mallows consistency, a handbook Young-score fixture, strict Dodgson scores, exhaustive cross-checks over every three-voter/three-candidate profile, misreport/deletion witnesses, incomplete-prefix bounds, combinatorial voting, resource conservation, envy/EF1, cut-and-choose, deferred acceptance, hedonic stability, voting power, doctrinal inconsistency, PageRank mass/convergence and knockout enumeration. Browser-level checks are documented in the release-wide verification record; this module document does not claim every UI cell was tested.
