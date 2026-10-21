# Chess Assist

Stockfish 19 WASM chess analysis overlay for chess.com. Desktop and mobile versions included.

## Desktop (chess-assist.js)

**Features:** Stockfish 19 WASM engine, adjustable depth (1–24, default 16), best-move green arrow, hidden arrows (subtle shading), auto-play with anti-repetition, move delay (random human-like timing), opponent's best move (red arrow, works on both turns), live win% eval bar, auto queen promotion, customizable keybinds for all toggles, info tooltips, draggable UI panel + icon, thinking indicator, hide all mode, MultiPV 3.

### Usage

1. Open a game on chess.com
2. Open browser DevTools (F12 → Console)
3. Paste the contents of `chess-assist.js` and press Enter
4. Click the knight icon to open the panel

### Controls

- **Depth slider** — engine search depth (1–24, default 16). Higher = stronger but slower
- **Show best move** — green arrow on the board showing the engine's top pick
- **Hidden arrows** — subtle square shading instead of visible arrow (opacity 0.07). Overrides green arrow when both are on
- **Auto-play** — plays the best move automatically each turn with anti-repetition to avoid draw loops
- **Move delay** — toggle on to add a random delay before auto-play moves (min/max sliders, 0–15s). Makes it look like a human thinking
- **Opponent's best** — red arrow (#e04040) showing the opponent's best reply to the current position. Shows on both your turn and the opponent's turn
- **Analyze once** — one-shot analysis without enabling continuous mode. Respects hidden arrows mode
- **Win% eval bar** — vertical bar next to the panel showing live win probability. White fill = white's advantage, updates every position change. Uses a logistic model (centipawn → win%) from Stockfish evaluation
- **Hide all** — hides the entire UI, arrows, shading, and pauses auto-play. Press keybind again to restore everything
- **Keybinds** — click the key badge next to any toggle to assign a hotkey. Supports single keys, modifier combos (Ctrl+G), and modifier-only binds (just Ctrl). Live preview while recording, click away or Escape to cancel. No duplicates allowed
- **Info tooltips** — click the (i) icon next to any toggle to see what it does
- **Pawn promotion** — automatically promotes to queen when a pawn reaches the last rank

## Mobile / iOS Safari (chess-assist-mobile.js)

Same features as desktop (including live win% eval bar) except no keybind system and no hide-all toggle (mobile doesn't use keyboards). Touch-optimized with larger targets (48px bubble, 28px switches, 22px slider thumbs), close button on panel, slightly longer timeouts for slower devices.

### Usage — Bookmarklet

The script is too large for a direct `javascript:` bookmark. Use the loader pattern:

1. Create a bookmark in Safari with this URL:
   ```
   javascript:void(fetch('https://raw.githubusercontent.com/Yoboisup7/chess-assist/main/chess-assist-mobile.js').then(r=>r.text()).then(eval))
   ```
2. Open a chess.com game in Safari, tap the bookmarklet
3. Tap the knight icon to open the panel

### Alternative — paste in console

On desktop Safari or any browser with console access, paste the contents of `chess-assist-mobile.js` directly.

## Engine

Both versions use Stockfish 19 WASM (lite single-threaded build) loaded from unpkg CDN. Falls back to ASM.js if WASM is unavailable. MultiPV 3 with anti-repetition logic to avoid draw loops.

## Arrow Colors

| Arrow | Color | Meaning |
|-------|-------|---------|
| Green | #96bc4b | Your best move |
| Red | #e04040 | Opponent's best reply |

## Notes

- Works on chess.com only (relies on chess.com DOM structure)
- The script runs entirely client-side — no data sent anywhere
- Both arrow types can be shown simultaneously (different SVG layers)
