# POLIS 2.0

**A browser-native political behavior research playground.** Build synthetic societies, edit policy packages, schedule information disruptions and corrections, inspect independent learners, and compare reproducible experiments.

This is a theory-exploration model, not a real-election forecasting system or an empirically calibrated model of human cognition. All people, communities and geographies are synthetic. It does not ingest voter files, generate political messages, or optimize real campaigns.

[Verified browser preview](docs/preview.jpg)

## Start exploring

The default lab starts immediately on an HTTP-served page. Pause or step one/ten rounds. Six persistent destinations preserve live state:

| Destination | What it does |
| --- | --- |
| Lab | Geographic/community layouts; voter and group inspection; election totals; learning, welfare, turnout and belief trajectories; event ledger; community, region, metadata and resource-band cohorts; CSV exports. |
| Society | Create/edit/delete community and geography generators; define categorical metadata; edit realized agents and overlapping memberships; create live manual hyperedges; regenerate communication structures. |
| Policies | Edit three policy packages over three issue axes; plurality, approval and full-ranking Borda; ties, abstention, ballot access, voting costs, reward components and Q-learning settings. |
| Interventions | Schedule false utility signals, correction, synthetic resistance, group-information blackout, ballot-access shocks and true outcome shocks. Set start, duration, repetition, signed intensity, coverage and intersecting filters. |
| Experiments | Six paired templates, custom one-parameter sweeps, 1–12 seeds, 10–500 rounds, fresh societies or conditional checkpoint forks, worker progress/cancellation, protocol and result exports. |
| Research | Equations, source-to-mechanism mapping, access notes, definitions and limitations. |

Use **Apply parameters** to commit numeric settings. Population/seed changes regenerate the society. Changing a voting rule or availability of abstention clears incompatible Q tables. Other live settings preserve agents and policies. Society-generator edits are drafts: save each edited generator, then **Apply generators & rebuild**. Agent edits and manual hyperedges apply immediately. Their exact realized state is preserved in checkpoints, not generator-only configuration exports.

### A useful first experiment

1. Choose **Rumor & delayed correction**. Pause and single-step to inspect offsets, beliefs and Q-values.
2. In Society, add a community, set its relative weight, issue ideals and traits, save it and rebuild. Add an abstract geography or metadata factor if useful.
3. In Interventions, combine community, geography, metadata, resource and optional agent-ID filters. The preview counts matching agents. Set the first round in the future, then schedule the event. Effects begin before that round's ballot.
4. Observe direct reach separately from secondary distortion prevalence. Disable future injections; existing offsets, beliefs and policies can persist.
5. In Experiments, compare no injection with a false signal, or compare false signal with delayed correction. State the question and inspect paired variability. A positive welfare difference is not guaranteed.

## Reproducibility and export

- **Export study**: generators, policy positions, model parameters and event schedule. Import restarts fresh.
- **Share settings**: URL for settings up to 12,000 URL characters; larger studies download as JSON. Never claims to share training history.
- **Checkpoint**: exact realized agents, metadata, custom memberships/groups, pending Q transitions, learned policies, history and current round. Saved in memory, optionally local storage, and downloaded. **Import** accepts the checkpoint file as well as study JSON.
- **Round metrics / agents CSV**: actual engine measurements and synthetic-agent state. No private or empirical voter data is included.
- **Experiment export**: question, full configuration, explicit baseline/treatment changes, seeds, endpoints, per-pair means and differences, first pair trajectories, and current snapshot for conditional studies. A cancelled study is marked incomplete.

Matching uses counter-based random draws keyed by seed, round, agent, channel and event identity. Fresh pairs share initial agents. Changing network structure deliberately changes opportunities. Snapshot-mode seeds vary conditional futures of the same population, not independent population samples. Manual groups and agent edits are absent from fresh generator studies; use snapshot mode to retain them.

## Deploy to GitHub Pages

1. Extract the ZIP. The `POLIS` directory contains the root `index.html`.
2. Copy **the contents of POLIS**, including `.github`, into your `Hyper-Graphs-on-multi-agent-RL-Voting-Systems` repository. Preserve existing research and review filename collisions before replacing anything.
3. Commit and push to `main`. Edit the workflow branch if yours differs.
4. In repository **Settings → Pages**, select **GitHub Actions**. The included workflow runs the engine tests and publishes static files without a website build step.
5. Open https://cat-logo-in-github.github.io/Hyper-Graphs-on-multi-agent-RL-Voting-Systems/ .

Relative URLs support the repository subpath. Nothing has been committed, pushed or publicly deployed on your behalf. The original repository was not available locally and was not visited or merged. This extends the standalone V1 implementation.

## Optional local testing

Serve this directory with any static server, for example `python -m http.server 8000`, and open http://localhost:8000 . ES modules and workers may fail under `file://`; use HTTP. Python is only an optional local testing tool. The deployed site needs no Node, npm, Python, account, server, API key, installation, compilation or remote runtime.

With Node 22+ installed for development only:

```
node --test tests/engine.test.js
node tests/repeated-study.js
node tests/check-package.js
```

No dependency installation is required. All runtime code is original local JavaScript; MIT license included. Full model, study protocol, bibliography, V2 changes and verification are in `docs/`. Examples are in `examples/` and can be imported through the UI.

## Scope

12–600 agents, 3 policies, 3 fixed issue axes, 16 community generators, 12 abstract regions, 8 categorical metadata factors, 40 events, 3,000 retained rounds. No guarantee of learning convergence, real-world causal identification or universally optimal institutions. See `docs/limitations.md` for the model's strongest assumptions and omissions.
