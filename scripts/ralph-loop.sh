#!/usr/bin/env bash
set -u

MIN_SECONDS="${RALPH_MIN_SECONDS:-1800}"
SLEEP_SECONDS="${RALPH_SLEEP_SECONDS:-45}"
LOG_FILE="${RALPH_LOG_FILE:-ralph-loop.log}"
START=$(date +%s)
END=$((START + MIN_SECONDS))
CYCLE=1

log() { printf '\n[%s] %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$*" | tee -a "$LOG_FILE"; }
run_check() {
  log "cycle $CYCLE :: $*"
  "$@" >> "$LOG_FILE" 2>&1
  STATUS=$?
  log "cycle $CYCLE :: exit $STATUS for $*"
  return 0
}

log "Ralph loop started; minimum seconds=$MIN_SECONDS; no human input required."
while [ "$(date +%s)" -lt "$END" ]; do
  run_check npm run test
  run_check npm run typecheck
  run_check npm run lint
  run_check npm run build
  CYCLE=$((CYCLE + 1))
  NOW=$(date +%s)
  REMAINING=$((END - NOW))
  if [ "$REMAINING" -gt 0 ]; then
    log "sleeping before next autonomous verification cycle; remaining=${REMAINING}s"
    sleep "$SLEEP_SECONDS"
  fi
done
log "Ralph loop complete after at least $MIN_SECONDS seconds."
