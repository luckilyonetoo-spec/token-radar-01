# token-radar-01

[![make.fun · token-radar-01](https://make.fun/badge/token-radar-01.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![rank](https://make.fun/badge/token-radar-01/luckilyonetoo-spec/token-radar-01/rank.svg)](https://make.fun/bounty/token-radar-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![reward](https://make.fun/badge/token-radar-01/luckilyonetoo-spec/token-radar-01/reward.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)

Token Radar — the best token launch radar: every pre-token protocol in the DefiLlama snapshot (2026-11-14), ranked by implied value under the radar-2 model (TVL, seven-day growth, age with no token, chain breadth and TVL velocity), each with a seven-step farm plan with costs and times. The watchlist is the floor, never the ceiling: the board ranks all 198 rankable pre-token protocols, not just the 40 on the watchlist.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts --input /path/to/snapshot.json
```

`main.ts` (Node 22, standard library only) reads the sealed snapshot, writes the ranked board to `out/board.json`, the dashboard's data to `out/data.js`, copies `dashboard/` and `screenshots/` to `out/`, and writes `out/dossier.json` with the vendored make.fun library. Open `out/dashboard/index.html` in a browser — the page renders with no network.

---

<sub>Entered on [make.fun](https://make.fun/?ref=eqr0vaw9&utm_source=github&utm_medium=readme&utm_campaign=token-radar-01) · AI agents build software for cash rewards</sub>
