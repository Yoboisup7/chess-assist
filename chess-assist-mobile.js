(() => {
  if (window.__chessHelper) return console.warn('already loaded');
  window.__chessHelper = true;

  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
    :root { --ch-accent:#81b64c; --ch-accent-hover:#a3d160; --ch-bg:rgba(20,20,23,0.82); --ch-border:rgba(255,255,255,0.1); --ch-radius:18px; --ch-font:'Outfit',system-ui,sans-serif; }
    #chess-helper-root { position:fixed; inset:0; pointer-events:none; z-index:99999; font-family:var(--ch-font); -webkit-tap-highlight-color:transparent; }
    #chess-helper-bubble { position:fixed; width:48px; height:48px; background:var(--ch-bg); -webkit-backdrop-filter:blur(20px); backdrop-filter:blur(20px); border:1px solid var(--ch-border); border-radius:50%; box-shadow:0 8px 30px -8px #0008; display:flex; align-items:center; justify-content:center; cursor:grab; color:#fff; pointer-events:auto; z-index:100000; user-select:none; touch-action:none; transition:transform .15s; }
    #chess-helper-bubble:active { transform:scale(1.12); }
    #chess-helper-bubble img { width:100%; height:100%; pointer-events:none; -webkit-user-drag:none; }
    #chess-helper-panel { position:fixed; width:min(270px,85vw); max-height:80vh; overflow-y:auto; background:rgba(18,18,20,0.9); -webkit-backdrop-filter:blur(24px); backdrop-filter:blur(24px); border:1px solid var(--ch-border); border-radius:var(--ch-radius); padding:16px; display:flex; flex-direction:column; gap:12px; box-shadow:0 16px 50px #0009; pointer-events:auto; opacity:0; transform:scale(0.92); transition:opacity .2s, transform .25s; pointer-events:none; -webkit-overflow-scrolling:touch; }
    #chess-helper-panel.visible { opacity:1; transform:scale(1); pointer-events:auto; }
    .ch-header { display:flex; justify-content:space-between; align-items:center; touch-action:none; user-select:none; min-height:28px; }
    .ch-title { font-size:15px; font-weight:700; color:#fff; }
    .ch-close { width:28px; height:28px; border-radius:50%; border:none; background:rgba(255,255,255,0.08); color:#fff; font-size:18px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
    .ch-row { display:flex; justify-content:space-between; align-items:center; gap:8px; min-height:36px; }
    .ch-label { font-size:13px; color:#fff; font-weight:500; flex:1; }
    .ch-switch { position:relative; width:48px; height:28px; flex-shrink:0; }
    .ch-switch input { opacity:0; width:0; height:0; position:absolute; }
    .ch-slider { position:absolute; cursor:pointer; inset:0; background:rgba(255,255,255,0.12); transition:.3s; border-radius:28px; }
    .ch-slider:before { content:""; position:absolute; height:22px; width:22px; left:3px; bottom:3px; background:#e4e4e7; transition:.3s; border-radius:50%; }
    input:checked + .ch-slider { background:var(--ch-accent); }
    input:checked + .ch-slider:before { transform:translateX(20px); background:#fff; }
    .ch-btn { padding:11px; border-radius:12px; border:1px solid rgba(255,255,255,0.05); background:rgba(255,255,255,0.06); color:#fff; font-family:var(--ch-font); font-size:13px; font-weight:600; cursor:pointer; transition:.2s; -webkit-tap-highlight-color:transparent; }
    .ch-btn-primary { background:var(--ch-accent); color:#121212; border:none; }
    .ch-btn-primary:active { background:var(--ch-accent-hover); }
    .ch-depth-row { display:flex; align-items:center; gap:8px; }
    .ch-depth-label { font-size:13px; color:#fff; font-weight:500; white-space:nowrap; }
    .ch-depth-val { font-size:13px; color:var(--ch-accent); font-weight:700; min-width:22px; text-align:center; }
    .ch-range { -webkit-appearance:none; appearance:none; flex:1; height:6px; background:rgba(255,255,255,0.15); border-radius:4px; outline:none; cursor:pointer; }
    .ch-range::-webkit-slider-thumb { -webkit-appearance:none; width:22px; height:22px; border-radius:50%; background:var(--ch-accent); cursor:pointer; }
    .ch-shade-overlay { position:absolute; pointer-events:none; z-index:999; border-radius:2px; transition:opacity .2s; }
    .ch-thinking { font-size:12px; color:var(--ch-accent); font-weight:600; text-align:center; animation:ch-pulse 1.2s infinite; display:none; }
    .ch-thinking.active { display:block; }
    .ch-info { width:20px; height:20px; border-radius:50%; border:1.5px solid rgba(255,255,255,0.25); color:rgba(255,255,255,0.35); font-size:10px; font-weight:700; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; font-style:italic; font-family:serif; line-height:1; transition:.2s; }
    .ch-info:hover { border-color:var(--ch-accent); color:var(--ch-accent); }
    .ch-tooltip { display:none; background:rgba(10,10,12,0.95); border:1px solid var(--ch-border); border-radius:10px; padding:8px 12px; font-size:11px; color:rgba(255,255,255,0.7); line-height:1.5; margin-top:4px; }
    .ch-tooltip.show { display:block; }
    @keyframes ch-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
  `;
  document.head.appendChild(style);

  window.chessHelper = { autoPlay: false, showArrow: false, hiddenArrow: false, showOpponent: false };

  const pieceToFen = { wp:'P',wn:'N',wb:'B',wr:'R',wq:'Q',wk:'K', bp:'p',bn:'n',bb:'b',br:'r',bq:'q',bk:'k' };

  function getBoard() { return document.querySelector('wc-chess-board') || document.querySelector('chess-board') || document.querySelector('.board'); }
  function getMyColor() { const b = getBoard(); return b?.classList.contains('flipped') ? 'b' : 'w'; }

  function inActiveGame() {
    const b = getBoard();
    if (b?.game?.getOptions?.()) return true;
    if (b?.game?.getFEN) {
      const clocks = document.querySelectorAll('.clock-component, .clock-bottom, .clock-top, [class*="clock-"]');
      if (clocks.length >= 2) return true;
    }
    return false;
  }

  function isMyTurn() {
    const b = getBoard();
    if (b?.game?.getFEN) {
      const turn = b.game.getFEN().split(' ')[1];
      return turn === getMyColor();
    }
    const bottom = document.querySelector('.clock-bottom');
    if (bottom && bottom.classList.contains('clock-player-turn')) return true;
    if (!document.querySelector('.clock-bottom') && !document.querySelector('.clock-top')) return true;
    return false;
  }

  function getFEN() {
    const b = getBoard();
    if (b?.game?.getFEN) {
      const fen = b.game.getFEN();
      if (fen && fen.includes('/')) {
        const parts = fen.split(' ');
        if (parts.length >= 4) parts[3] = '-';
        return parts.join(' ');
      }
    }
    const pieces = document.querySelectorAll('.piece');
    if (!pieces.length) return null;
    const board = Array.from({length:8}, () => Array(8).fill(null));
    pieces.forEach(p => {
      const cls = [...p.classList];
      const type = cls.find(c => pieceToFen[c]);
      const sq = cls.find(c => c.startsWith('square-'));
      if (type && sq) {
        const n = sq.split('-')[1];
        board[8 - +n[1]][+n[0] - 1] = pieceToFen[type];
      }
    });
    const rows = board.map(r => {
      let s = '', e = 0;
      for (const c of r) { if (!c) e++; else { if (e) s += e; e = 0; s += c; } }
      return s + (e || '');
    });
    return rows.join('/') + ` ${getMyColor()} - - 0 1`;
  }

  const positionMoves = new Map();
  const REPEAT_THRESHOLD = 2;
  let ENGINE_DEPTH = 16;
  const MULTI_PV = 3;
  let DELAY_MIN = 1, DELAY_MAX = 5, DELAY_ENABLED = false;

  function boardKey(fen) {
    const parts = fen.split(' ');
    return parts[0] + ' ' + (parts[1] || 'w');
  }

  let sfWorker = null, sfReady = false;

  async function initEngine() {
    if (sfWorker) return;
    const base = 'https://unpkg.com/stockfish@19.0.1/bin/';
    try {
      const [jsCode, wasmBuf] = await Promise.all([
        fetch(base + 'stockfish-19-lite-single.js').then(r => r.text()),
        fetch(base + 'stockfish-19-lite-single.wasm').then(r => r.arrayBuffer())
      ]);
      const boot = 'self.onmessage=function(e){if(e.data&&e.data.type==="init"){self.onmessage=null;var w=e.data.wasm,done=false,of=self.fetch;self.fetch=function(u,o){if(!done){done=true;return Promise.resolve(new Response(w,{status:200,headers:{"Content-Type":"application/wasm"}}))}return of.call(self,u,o)};importScripts(URL.createObjectURL(new Blob([e.data.js],{type:"application/javascript"})))}};';
      sfWorker = new Worker(URL.createObjectURL(new Blob([boot], { type: 'application/javascript' })));
      sfWorker.postMessage({ type: 'init', wasm: wasmBuf, js: jsCode }, [wasmBuf]);
      await uciCommand('uci', 'uciok');
      uciSend('setoption name MultiPV value ' + MULTI_PV);
      await uciCommand('isready', 'readyok');
      sfReady = true;
      console.log('SF19 WASM ready (depth ' + ENGINE_DEPTH + ')');
    } catch (e) {
      console.warn('WASM failed, trying ASM:', e.message);
      sfWorker = null;
      try {
        const r = await fetch(base + 'stockfish-19-asm.js');
        const code = await r.text();
        sfWorker = new Worker(URL.createObjectURL(new Blob([code], { type: 'application/javascript' })));
        await uciCommand('uci', 'uciok');
        uciSend('setoption name MultiPV value ' + MULTI_PV);
        await uciCommand('isready', 'readyok');
        sfReady = true;
        console.log('SF19 ASM fallback ready');
      } catch (e2) {
        console.error('Engine init failed:', e2);
        sfWorker = null;
      }
    }
  }

  function uciSend(cmd) { if (sfWorker) sfWorker.postMessage(cmd); }

  function uciCommand(cmd, waitFor) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('UCI timeout')), 15000);
      const handler = (e) => {
        if (typeof e.data === 'string' && e.data.startsWith(waitFor)) {
          clearTimeout(timeout);
          sfWorker.removeEventListener('message', handler);
          resolve(e.data);
        }
      };
      sfWorker.addEventListener('message', handler);
      uciSend(cmd);
    });
  }

  function queryLocal(fen, depth) {
    return new Promise((resolve) => {
      if (!sfWorker || !sfReady) { resolve([]); return; }
      const moves = {};
      const timeout = setTimeout(() => {
        sfWorker.removeEventListener('message', handler);
        resolve(Object.entries(moves).sort((a, b) => a[0] - b[0]).map(e => e[1]));
      }, 12000);
      const handler = (e) => {
        const line = typeof e.data === 'string' ? e.data : '';
        const pvMatch = line.match(/multipv\s+(\d+).*?\bpv\s+(\S+)/);
        if (pvMatch) {
          const pvIdx = parseInt(pvMatch[1]);
          const mv = pvMatch[2];
          if (mv.length >= 4) {
            const scoreMatch = line.match(/score\s+(cp\s+[-\d]+|mate\s+[-\d]+)/);
            let cp = null;
            if (scoreMatch) {
              const parts = scoreMatch[1].split(/\s+/);
              cp = parts[0] === 'mate' ? (parseInt(parts[1]) > 0 ? 99999 : -99999) : parseInt(parts[1]);
            }
            moves[pvIdx] = { move: mv.slice(0, 4), cp };
          }
        }
        if (line.startsWith('bestmove')) {
          clearTimeout(timeout);
          sfWorker.removeEventListener('message', handler);
          const best = line.split(/\s+/)[1];
          if (best && best.length >= 4 && !moves[1]) moves[1] = { move: best.slice(0, 4), cp: null };
          resolve(Object.entries(moves).sort((a, b) => a[0] - b[0]).map(e => e[1]));
        }
      };
      sfWorker.addEventListener('message', handler);
      uciSend('position fen ' + fen);
      uciSend('go depth ' + depth);
    });
  }

  async function fetchRemote(fen) {
    if (!sfReady) await initEngine();
    const key = boardKey(fen);
    const played = positionMoves.get(key) || [];
    const candidates = await queryLocal(fen, ENGINE_DEPTH);
    if (!candidates.length) return null;
    for (const c of candidates) {
      const count = played.filter(m => m === c.move).length;
      if (count < REPEAT_THRESHOLD) return c.move;
    }
    return candidates[0].move;
  }

  function flipFEN(fen) {
    const parts = fen.split(' ');
    parts[1] = parts[1] === 'w' ? 'b' : 'w';
    return parts.join(' ');
  }

  async function queryOpponentBest(fen) {
    if (!sfReady) await initEngine();
    const flipped = flipFEN(fen);
    const candidates = await queryLocal(flipped, ENGINE_DEPTH);
    if (!candidates.length) return null;
    return candidates[0].move;
  }

  function recordMove(fen, move) {
    const key = boardKey(fen);
    const played = positionMoves.get(key) || [];
    played.push(move);
    positionMoves.set(key, played);
  }

  initEngine();

  function clickSquare(sq) {
    const b = getBoard(); if (!b) return;
    const rect = b.getBoundingClientRect();
    const sqSize = rect.width / 8;
    const file = sq.charCodeAt(0) - 97;
    const rank = parseInt(sq[1]);
    const flipped = b.classList.contains('flipped');
    const x = flipped
      ? rect.left + (7 - file) * sqSize + sqSize / 2
      : rect.left + file * sqSize + sqSize / 2;
    const y = flipped
      ? rect.top + (rank - 1) * sqSize + sqSize / 2
      : rect.top + (8 - rank) * sqSize + sqSize / 2;
    for (const type of ['pointerdown', 'pointerup', 'click']) {
      const Cls = type === 'click' ? MouseEvent : PointerEvent;
      b.dispatchEvent(new Cls(type, {
        bubbles: true, cancelable: true, view: window,
        clientX: x, clientY: y, button: 0,
        buttons: type === 'pointerdown' ? 1 : 0,
        pointerId: 1, isPrimary: true, pointerType: 'touch'
      }));
    }
  }

  function isPromotion(fen, from, to) {
    const rank = to[1];
    if (rank !== '8' && rank !== '1') return false;
    const rows = ((fen || '').split(' ')[0] || '').split('/');
    const file = from.charCodeAt(0) - 97;
    const rowIdx = 8 - parseInt(from[1]);
    if (rowIdx < 0 || rowIdx > 7) return false;
    const row = rows[rowIdx] || '';
    let col = 0;
    for (const ch of row) {
      if (ch >= '1' && ch <= '8') col += parseInt(ch);
      else { if (col === file) return ch === 'P' || ch === 'p'; col++; }
    }
    return false;
  }

  async function makeMove(move) {
    if (!move || move.length < 4) return;
    const from = move.slice(0,2), to = move.slice(2,4);
    const fenBefore = getFEN();
    const needsPromo = isPromotion(fenBefore, from, to);
    const promoChar = move.length > 4 ? move[4] : 'q';

    for (let attempt = 0; attempt < 3; attempt++) {
      clickSquare(from);
      await new Promise(r => setTimeout(r, 250 + attempt * 150));
      clickSquare(to);
      await new Promise(r => setTimeout(r, 350));
      if (needsPromo) {
        const color = getMyColor() || 'w';
        for (let pi = 0; pi < 8; pi++) {
          const promoWin = document.querySelector('.promotion-window, .promotion-area, [class*="promotion"]');
          if (!promoWin) { await new Promise(r => setTimeout(r, 200)); continue; }
          const el = promoWin.querySelector(`.${color}${promoChar}, [class*="${color}${promoChar}"], [data-piece="${promoChar}"], [data-piece="${color}${promoChar}"]`)
            || promoWin.querySelector(`[class*="${promoChar}"]`)
            || promoWin.querySelector('[class*="queen"], [data-piece="q"], [data-piece="wq"], [data-piece="bq"]')
            || promoWin.children[0];
          if (el) {
            const r = el.getBoundingClientRect();
            const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
            for (const type of ['pointerdown', 'pointerup', 'click']) {
              const Cls = type === 'click' ? MouseEvent : PointerEvent;
              el.dispatchEvent(new Cls(type, { bubbles: true, cancelable: true, view: window, clientX: cx, clientY: cy, button: 0, buttons: type === 'pointerdown' ? 1 : 0, pointerId: 1, isPrimary: true, pointerType: 'touch' }));
            }
            break;
          }
          await new Promise(r => setTimeout(r, 200));
        }
        await new Promise(r => setTimeout(r, 350));
      }
      if (getFEN() !== fenBefore) break;
    }
  }

  function clearArrows() {
    const b = getBoard();
    try { if (b?.game?.markings?.removeAll) b.game.markings.removeAll(); } catch {}
    document.querySelectorAll('.ch-arrow-svg').forEach(e => e.remove());
  }

  function clearShading() {
    document.querySelectorAll('.ch-shade-overlay').forEach(e => e.remove());
  }

  function drawShading(move) {
    clearShading();
    const b = getBoard(); if (!b || !move) return;
    const from = move.slice(0, 2), to = move.slice(2, 4);
    const rect = b.getBoundingClientRect();
    const sqSize = rect.width / 8;
    const flipped = b.classList.contains('flipped');
    if (getComputedStyle(b).position === 'static') b.style.position = 'relative';
    for (const sq of [from, to]) {
      const file = sq.charCodeAt(0) - 97;
      const rank = parseInt(sq[1]);
      const px = flipped ? (7 - file) * sqSize : file * sqSize;
      const py = flipped ? (rank - 1) * sqSize : (8 - rank) * sqSize;
      const overlay = document.createElement('div');
      overlay.className = 'ch-shade-overlay';
      overlay.style.cssText = `left:${px}px;top:${py}px;width:${sqSize}px;height:${sqSize}px;background:rgba(0,0,0,0.07);`;
      b.appendChild(overlay);
    }
  }

  function squareToPct(sq, flipped) {
    const file = sq.charCodeAt(0) - 97;
    const rank = +sq[1];
    if (flipped) return { x: (7 - file) * 12.5 + 6.25, y: (rank - 1) * 12.5 + 6.25 };
    return { x: file * 12.5 + 6.25, y: (8 - rank) * 12.5 + 6.25 };
  }

  function drawArrowSVG(b, move, color, opacity, cssClass, zIndex) {
    const from = move.slice(0, 2), to = move.slice(2, 4);
    const flipped = b.classList.contains('flipped');
    const s = squareToPct(from, flipped);
    const e = squareToPct(to, flipped);
    const dx = e.x - s.x, dy = e.y - s.y;
    const len = Math.hypot(dx, dy);
    if (len < 0.5) return;
    const ux = dx / len, uy = dy / len;
    const headLen = 4.5, headW = 3.5, bodyW = 1.4;
    const tipX = e.x - ux * 1, tipY = e.y - uy * 1;
    const baseX = s.x + ux * 1, baseY = s.y + uy * 1;
    const neckX = tipX - ux * headLen, neckY = tipY - uy * headLen;
    const nx = -uy, ny = ux;
    const pts = [
      [baseX + nx * bodyW, baseY + ny * bodyW],
      [neckX + nx * bodyW, neckY + ny * bodyW],
      [neckX + nx * headW, neckY + ny * headW],
      [tipX, tipY],
      [neckX - nx * headW, neckY - ny * headW],
      [neckX - nx * bodyW, neckY - ny * bodyW],
      [baseX - nx * bodyW, baseY - ny * bodyW],
    ];
    let svg = b.querySelector('.' + cssClass);
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 100 100');
      svg.classList.add(cssClass);
      svg.style.cssText = `position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:${zIndex};`;
      if (getComputedStyle(b).position === 'static') b.style.position = 'relative';
      b.appendChild(svg);
    } else { svg.innerHTML = ''; }
    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', pts.map(p => p[0].toFixed(2) + ',' + p[1].toFixed(2)).join(' '));
    poly.setAttribute('fill', color);
    poly.setAttribute('opacity', opacity);
    svg.appendChild(poly);
  }

  function drawNativeArrow(move) {
    clearArrows();
    const b = getBoard(); if (!b || !move) return;
    const from = move.slice(0, 2), to = move.slice(2, 4);
    try {
      if (b.game?.markings?.addMany) {
        b.game.markings.addMany([{ data: { from, to, color: '#96bc4b', opacity: 0.8 }, type: 'arrow' }]);
        return;
      }
    } catch {}
    drawArrowSVG(b, move, '#96bc4b', '0.8', 'ch-arrow-svg', 1000);
  }

  function clearOpponentArrow() {
    document.querySelectorAll('.ch-opponent-svg').forEach(e => e.remove());
  }

  function drawOpponentArrow(move) {
    clearOpponentArrow();
    const b = getBoard(); if (!b || !move) return;
    drawArrowSVG(b, move, '#e04040', '0.8', 'ch-opponent-svg', 1002);
  }

  let processing = false, lastFen = '', lastMovedFen = '';
  async function tick() {
    if ((!window.chessHelper.autoPlay && !window.chessHelper.showArrow && !window.chessHelper.hiddenArrow && !window.chessHelper.showOpponent) || processing) return;
    if (!inActiveGame()) return;
    const myTurn = isMyTurn();
    if (!myTurn) {
      lastFen = '';
      clearArrows();
      clearShading();
      const fen = getFEN();
      if (fen && window.chessHelper.showOpponent) {
        processing = true;
        try {
          const om = await queryOpponentBest(fen);
          if (om) drawOpponentArrow(om);
          else clearOpponentArrow();
        } catch {} finally { processing = false; }
      } else clearOpponentArrow();
      return;
    }
    const fen = getFEN(); if (!fen) return;
    if (fen === lastFen) return;
    if (window.chessHelper.autoPlay && fen === lastMovedFen) return;

    processing = true;
    thinkingEl.classList.add('active');
    try {
      const mv = await fetchRemote(fen);
      thinkingEl.classList.remove('active');
      if (!mv) return;
      lastFen = fen;
      if (window.chessHelper.hiddenArrow) { drawShading(mv); clearArrows(); }
      else if (window.chessHelper.showArrow) { drawNativeArrow(mv); clearShading(); }
      if (window.chessHelper.showOpponent) {
        const om = await queryOpponentBest(fen);
        if (om) drawOpponentArrow(om);
        else clearOpponentArrow();
      } else clearOpponentArrow();
      if (window.chessHelper.autoPlay) {
        if (DELAY_ENABLED) {
          const delay = (DELAY_MIN + Math.random() * (DELAY_MAX - DELAY_MIN)) * 1000;
          await new Promise(r => setTimeout(r, delay));
          if (!window.chessHelper.autoPlay) return;
        }
        recordMove(fen, mv);
        await makeMove(mv);
        const fenAfter = getFEN();
        if (fenAfter !== fen) lastMovedFen = fenAfter;
        else lastFen = '';
      }
    } catch {} finally { processing = false; thinkingEl.classList.remove('active'); }
  }

  const obs = new MutationObserver(() => { if (window.chessHelper.autoPlay || window.chessHelper.showArrow || window.chessHelper.hiddenArrow || window.chessHelper.showOpponent) tick(); });
  function watch() {
    const b = getBoard();
    if (b) obs.observe(b, { childList:true, subtree:true, attributes:true });
    else setTimeout(watch, 1000);
  }
  watch();
  setInterval(tick, 600);

  const root = document.createElement('div'); root.id = 'chess-helper-root';
  const bubble = document.createElement('div'); bubble.id = 'chess-helper-bubble';
  bubble.innerHTML = `<img src="https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wn.png" draggable="false">`;
  const panel = document.createElement('div'); panel.id = 'chess-helper-panel';
  panel.innerHTML = `
    <div class="ch-header">
      <div class="ch-title">Chess Assist</div>
      <button class="ch-close" id="ch-close">&times;</button>
    </div>
    <div class="ch-thinking" id="ch-thinking">Thinking...</div>
    <div>
      <div class="ch-depth-row">
        <span class="ch-depth-label">Depth</span>
        <span class="ch-info" data-tip="depth">i</span>
        <input type="range" class="ch-range" id="ch-depth" min="1" max="24" value="16">
        <span class="ch-depth-val" id="ch-depth-val">16</span>
      </div>
      <div class="ch-tooltip" id="tip-depth">How many moves ahead the engine calculates. Higher = stronger but slower. 16 is a good balance. Below 10 is fast but weaker, above 20 is very slow.</div>
    </div>
    <div>
      <div class="ch-row">
        <span class="ch-label">Show best move</span>
        <span class="ch-info" data-tip="arrow">i</span>
        <label class="ch-switch"><input type="checkbox" id="ch-arrow"><span class="ch-slider"></span></label>
      </div>
      <div class="ch-tooltip" id="tip-arrow">Draws a green arrow on the board showing the best move the engine found.</div>
    </div>
    <div>
      <div class="ch-row">
        <span class="ch-label">Hidden arrows</span>
        <span class="ch-info" data-tip="hidden">i</span>
        <label class="ch-switch"><input type="checkbox" id="ch-hidden"><span class="ch-slider"></span></label>
      </div>
      <div class="ch-tooltip" id="tip-hidden">Instead of a visible arrow, subtly darkens the piece square and target square. Hard to notice unless you know what to look for. Overrides the green arrow when both are on.</div>
    </div>
    <div>
      <div class="ch-row">
        <span class="ch-label">Auto-play</span>
        <span class="ch-info" data-tip="auto">i</span>
        <label class="ch-switch"><input type="checkbox" id="ch-auto"><span class="ch-slider"></span></label>
      </div>
      <div class="ch-tooltip" id="tip-auto">Automatically plays the best move for you when it's your turn. Uses anti-repetition to avoid repeating the same moves.</div>
    </div>
    <div>
      <div class="ch-row"><span class="ch-label">Move delay</span><span class="ch-info" data-tip="delay">i</span><label class="ch-switch"><input type="checkbox" id="ch-delay-toggle"><span class="ch-slider"></span></label></div>
      <div class="ch-tooltip" id="tip-delay">Random delay before auto-play makes a move, so it looks like a human thinking. Set a min and max range in seconds. Off by default — the engine moves as soon as it finishes calculating.</div>
      <div id="ch-delay-sliders" style="display:none">
        <div class="ch-depth-row" style="margin-top:6px"><span class="ch-depth-label">Min</span><input type="range" class="ch-range" id="ch-delay-min" min="0" max="15" value="1" step="0.5"><span class="ch-depth-val" id="ch-delay-min-val">1s</span></div>
        <div class="ch-depth-row" style="margin-top:4px"><span class="ch-depth-label">Max</span><input type="range" class="ch-range" id="ch-delay-max" min="0" max="15" value="5" step="0.5"><span class="ch-depth-val" id="ch-delay-max-val">5s</span></div>
      </div>
    </div>
    <div>
      <div class="ch-row">
        <span class="ch-label">Opponent's best</span>
        <span class="ch-info" data-tip="opponent">i</span>
        <label class="ch-switch"><input type="checkbox" id="ch-opponent"><span class="ch-slider"></span></label>
      </div>
      <div class="ch-tooltip" id="tip-opponent">Shows a red arrow for the opponent's best reply to the current position. Helps you anticipate what they'll play next.</div>
    </div>
    <button class="ch-btn ch-btn-primary" id="ch-analyze">Analyze once</button>
  `;
  root.append(bubble, panel); document.body.appendChild(root);

  const thinkingEl = panel.querySelector('#ch-thinking');

  panel.querySelectorAll('.ch-info[data-tip]').forEach(el => {
    el.ontouchend = el.onclick = (ev) => { ev.preventDefault(); const tip = panel.querySelector('#tip-' + el.dataset.tip); if (tip) tip.classList.toggle('show'); };
  });

  let bx = window.innerWidth - 64, by = window.innerHeight * 0.4;
  let bDrag = false, bMoved = false, bsx = 0, bsy = 0;
  function setBubblePos() { bubble.style.transform = `translate3d(${bx}px,${by}px,0)`; }
  setBubblePos();

  function bStart(cx, cy) { bDrag = true; bMoved = false; bsx = cx - bx; bsy = cy - by; }
  function bMove(cx, cy) { if (!bDrag) return; bMoved = true; bx = Math.max(0, Math.min(cx - bsx, innerWidth - 48)); by = Math.max(0, Math.min(cy - bsy, innerHeight - 48)); setBubblePos(); }
  function bEnd() { if (!bDrag) return; bDrag = false; if (!bMoved) { panel.classList.toggle('visible'); positionPanel(); } }

  bubble.addEventListener('touchstart', (e) => { e.preventDefault(); const t = e.touches[0]; bStart(t.clientX, t.clientY); }, { passive: false });
  document.addEventListener('touchmove', (e) => { if (bDrag) { e.preventDefault(); const t = e.touches[0]; bMove(t.clientX, t.clientY); } }, { passive: false });
  document.addEventListener('touchend', bEnd);
  bubble.addEventListener('mousedown', (e) => { bStart(e.clientX, e.clientY); });
  document.addEventListener('mousemove', (e) => { bMove(e.clientX, e.clientY); });
  document.addEventListener('mouseup', bEnd);

  let ppx = -1, ppy = -1, pDrag = false, psx = 0, psy = 0;
  function positionPanel() {
    if (ppx < 0) {
      const pw = Math.min(270, innerWidth * 0.85);
      ppx = Math.max(8, Math.min(bx - pw - 8, innerWidth - pw - 8));
      if (ppx < 8) ppx = Math.max(8, (innerWidth - pw) / 2);
      ppy = Math.max(8, Math.min(by, innerHeight - 340));
    }
    ppx = Math.max(0, Math.min(ppx, innerWidth - 100));
    ppy = Math.max(0, Math.min(ppy, innerHeight - 50));
    panel.style.left = ppx + 'px'; panel.style.top = ppy + 'px';
  }

  const header = panel.querySelector('.ch-header');
  header.addEventListener('touchstart', (e) => { const t = e.touches[0]; pDrag = true; psx = t.clientX - ppx; psy = t.clientY - ppy; }, { passive: true });
  document.addEventListener('touchmove', (e) => { if (pDrag) { const t = e.touches[0]; ppx = t.clientX - psx; ppy = t.clientY - psy; positionPanel(); } }, { passive: true });
  document.addEventListener('touchend', () => { pDrag = false; });
  header.addEventListener('mousedown', (e) => { pDrag = true; psx = e.clientX - ppx; psy = e.clientY - ppy; e.preventDefault(); });
  document.addEventListener('mousemove', (e) => { if (pDrag) { ppx = e.clientX - psx; ppy = e.clientY - psy; positionPanel(); } });
  document.addEventListener('mouseup', () => { pDrag = false; });

  panel.querySelector('#ch-close').onclick = () => panel.classList.remove('visible');

  panel.querySelector('#ch-depth').oninput = (e) => {
    ENGINE_DEPTH = parseInt(e.target.value);
    panel.querySelector('#ch-depth-val').textContent = ENGINE_DEPTH;
  };
  panel.querySelector('#ch-delay-toggle').onchange = (e) => {
    DELAY_ENABLED = e.target.checked;
    panel.querySelector('#ch-delay-sliders').style.display = e.target.checked ? '' : 'none';
  };
  panel.querySelector('#ch-delay-min').oninput = (e) => {
    DELAY_MIN = parseFloat(e.target.value);
    if (DELAY_MIN > DELAY_MAX) { DELAY_MAX = DELAY_MIN; panel.querySelector('#ch-delay-max').value = DELAY_MAX; panel.querySelector('#ch-delay-max-val').textContent = DELAY_MAX + 's'; }
    panel.querySelector('#ch-delay-min-val').textContent = DELAY_MIN + 's';
  };
  panel.querySelector('#ch-delay-max').oninput = (e) => {
    DELAY_MAX = parseFloat(e.target.value);
    if (DELAY_MAX < DELAY_MIN) { DELAY_MIN = DELAY_MAX; panel.querySelector('#ch-delay-min').value = DELAY_MIN; panel.querySelector('#ch-delay-min-val').textContent = DELAY_MIN + 's'; }
    panel.querySelector('#ch-delay-max-val').textContent = DELAY_MAX + 's';
  };
  panel.querySelector('#ch-arrow').onchange = (e) => {
    window.chessHelper.showArrow = e.target.checked;
    if (!e.target.checked) clearArrows(); else { lastFen = ''; tick(); }
  };
  panel.querySelector('#ch-hidden').onchange = (e) => {
    window.chessHelper.hiddenArrow = e.target.checked;
    if (!e.target.checked) clearShading(); else { lastFen = ''; tick(); }
  };
  panel.querySelector('#ch-auto').onchange = (e) => {
    window.chessHelper.autoPlay = e.target.checked;
    if (e.target.checked) { lastFen = ''; lastMovedFen = ''; tick(); }
  };
  panel.querySelector('#ch-analyze').onclick = async () => {
    const btn = panel.querySelector('#ch-analyze');
    btn.textContent = 'Analyzing...';
    thinkingEl.classList.add('active');
    const fen = getFEN();
    if (!fen) { btn.textContent = 'No board found'; thinkingEl.classList.remove('active'); setTimeout(() => btn.textContent = 'Analyze once', 2000); return; }
    const mv = await fetchRemote(fen);
    thinkingEl.classList.remove('active');
    if (mv) {
      if (window.chessHelper.hiddenArrow) { drawShading(mv); clearArrows(); }
      else { drawNativeArrow(mv); }
      btn.textContent = `Best: ${mv.toUpperCase()}`;
    }
    else btn.textContent = 'Error';
    setTimeout(() => btn.textContent = 'Analyze once', 2500);
  };
  panel.querySelector('#ch-opponent').onchange = (e) => {
    window.chessHelper.showOpponent = e.target.checked;
    if (!e.target.checked) clearOpponentArrow();
    else { lastFen = ''; tick(); }
  };

  console.log('chess helper (mobile) loaded');
})();
