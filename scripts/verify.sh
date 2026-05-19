#!/usr/bin/env bash
set -euo pipefail

echo "[room-reader] verify: test"
npm run test
echo "[room-reader] verify: typecheck"
npm run typecheck
echo "[room-reader] verify: lint"
npm run lint
echo "[room-reader] verify: build"
npm run build
echo "[room-reader] all verification checks passed"
