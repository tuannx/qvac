# Perf baselines — qvac (fork)

Lightweight, dependency-free perf harness for pure TypeScript core functions.
No model loading, no native addons, no network — the repo's model/device
benchmarks (`.github/workflows/benchmarks.yml`, per-package `ci/benchmark.mjs`)
remain the heavyweight lane.

## Scope

- `packages/rag/src/diversify.ts` — `selectDiverse()` result diversification
- `packages/sdk/src/utils/cache-normalize.ts` — `normalizeAssistantCacheContent()`
- `packages/sdk/src/utils/path-sanitize.ts` — `sanitizePathComponent()` + `checkPathWithinBase()`

See `perf/bench.mjs` for fixtures and fixed warmup/iterations.

## Run

```sh
./perf/run-perf.sh                    # compare vs perf/baseline.json
node perf/run-perf.mjs --write-baseline   # regenerate baseline (only on purpose)
```

Requires Node >= 22 (type-stripping imports the `.ts` sources directly; no
install, no build). Verdict: median regression >10% = warn, >25% = block
(exit 1). Baseline metadata (environment, fork commit) is in
`perf/baseline.json`.
