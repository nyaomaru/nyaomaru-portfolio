# Learned Patterns

- **[clear-sequence-phased-animation](learned/clear-sequence-phased-animation.md)** - Model clear animation with explicit phases and timer-driven transitions to avoid render/animation conflicts.
- **[obstacle-size-hitbox-calibration](learned/obstacle-size-hitbox-calibration.md)** - Keep obstacle visual scale and collision shrink rules explicit so difficulty tuning stays predictable.
- **[boss-bob-phase-and-ground-charge-gating](learned/boss-bob-phase-and-ground-charge-gating.md)** - Start boss bob from entry-relative phase and gate attack with explicit grounded charge time.
- **[jumpgame-css-modules-with-runtime-css-vars](learned/jumpgame-css-modules-with-runtime-css-vars.md)** - Move UI animation styles to CSS Modules while passing flyout timing/position through CSS variables.
- **[react-imperative-style-ownership-for-game-loop](learned/react-imperative-style-ownership-for-game-loop.md)** - Prevent flicker by separating React static styles from per-frame imperative style writes in animation hooks.
- **[deferred-clear-until-boss-attack-settles](learned/deferred-clear-until-boss-attack-settles.md)** - Defer clear transition until boss arm FSM returns to idle, then normalize pose before exit.
- **[mobile-initial-position-mismatch-from-js-breakpoint](learned/mobile-initial-position-mismatch-from-js-breakpoint.md)** - Fix initial-vs-retry position drift by moving responsive placement from JS breakpoint flags to CSS media-query ownership.
- **[prune-unused-debug-contracts-in-loop-hooks](learned/prune-unused-debug-contracts-in-loop-hooks.md)** - Remove stale debug params and branches from loop hook APIs to keep contracts minimal and maintainable.
- **[render-time-ref-sync-in-loop-hooks](learned/render-time-ref-sync-in-loop-hooks.md)** - Replace sync-only ref effects with render-time ref assignment while keeping listener effects stable.
- **[game-loop-subdirectory-with-barrel-api](learned/game-loop-subdirectory-with-barrel-api.md)** - Group complex hook families under a dedicated directory and expose a single import via barrel.
- **[type-property-comments-and-public-jsdoc](learned/type-property-comments-and-public-jsdoc.md)** - Add property-level type comments and JSDoc on exported functions to stabilize model contracts.
- **[boss-sprite-layer-split-with-requested-src-guard](learned/boss-sprite-layer-split-with-requested-src-guard.md)** - Split boss sprite rendering into img-src control with requested/current guard and stable attack width to reduce flicker.
- **[server-gateway-barrel-for-remix-bundle-splitting](learned/server-gateway-barrel-for-remix-bundle-splitting.md)** - Split feature exports into client-safe and server-only gateways to avoid Remix client bundle leaks.
- **[hybrid-obstacle-motion-mobile-delta-pc-legacy-pace](learned/hybrid-obstacle-motion-mobile-delta-pc-legacy-pace.md)** - Apply delta-time motion on mobile while keeping PC obstacle pace equivalent to legacy frame-based behavior.
- **[right-edge-rocket-entry-paced-by-obstacle-speed](learned/right-edge-rocket-entry-paced-by-obstacle-speed.md)** - Start special rocket at the true right edge and compute entry duration from obstacle speed to keep ending motion natural.
- **[behavior-preserving-loop-decomposition](learned/behavior-preserving-loop-decomposition.md)** - Decompose large gameplay hooks into runtime/viewport/timeline modules while preserving existing behavior and APIs.
- **[moving-entity-motion-contract](learned/moving-entity-motion-contract.md)** - Centralize spawn/update motion state rules for obstacles and fish to prevent contract drift.
