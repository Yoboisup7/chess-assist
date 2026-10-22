(() => {
  if (window.__chessHelper) return console.warn('already loaded');
  window.__chessHelper = true;

  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
    :root { --ch-accent:#81b64c; --ch-accent-hover:#a3d160; --ch-bg:rgba(20,20,23,0.75); --ch-border:rgba(255,255,255,0.1); --ch-radius:20px; --ch-font:'Outfit',system-ui,sans-serif; }
    #chess-helper-root { position:fixed; inset:0; pointer-events:none; z-index:99999; font-family:var(--ch-font); }
    #chess-helper-bubble { position:fixed; width:52px; height:52px; background:var(--ch-bg); backdrop-filter:blur(20px); border:1px solid var(--ch-border); border-radius:50%; box-shadow:0 10px 40px -10px #0008; display:flex; align-items:center; justify-content:center; cursor:grab; color:#fff; pointer-events:auto; z-index:100000; user-select:none; transition:transform .2s; }
    #chess-helper-bubble:hover { transform:scale(1.1); }
    #chess-helper-bubble img { width:100%; height:100%; pointer-events:none; }
    #chess-helper-wrap { position:fixed; display:flex; align-items:stretch; gap:8px; opacity:0; transform:scale(0.9); transition:opacity .25s, transform .3s; pointer-events:none; }
    #chess-helper-wrap.visible { opacity:1; transform:scale(1); pointer-events:auto; }
    #chess-helper-panel { width:280px; background:rgba(18,18,20,0.85); backdrop-filter:blur(24px); border:1px solid var(--ch-border); border-radius:var(--ch-radius); padding:20px; display:flex; flex-direction:column; gap:14px; box-shadow:0 20px 60px #0009; pointer-events:auto; }
    #ch-eval-bar { width:28px; border-radius:14px; overflow:hidden; background:#000; border:1px solid var(--ch-border); box-shadow:0 10px 40px -10px #0008; position:relative; pointer-events:auto; min-height:200px; }
    #ch-eval-white { position:absolute; bottom:0; left:0; right:0; background:#fff; transition:height .6s ease; height:50%; }
    #ch-eval-pct { position:absolute; width:100%; text-align:center; font-size:10px; font-weight:700; font-family:var(--ch-font); z-index:1; left:0; }
    #ch-eval-pct-top { top:6px; color:#fff; }
    #ch-eval-pct-bot { bottom:6px; color:#000; }
    .ch-header { display:flex; justify-content:space-between; align-items:center; cursor:grab; user-select:none; }
    .ch-title { font-size:16px; font-weight:700; color:#fff; }
    .ch-close { width:24px; height:24px; border-radius:50%; border:none; background:rgba(255,255,255,0.08); color:#fff; font-size:16px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:.2s; }
    .ch-close:hover { background:rgba(255,255,255,0.18); }
    .ch-row { display:flex; justify-content:space-between; align-items:center; gap:6px; }
    .ch-label { font-size:13px; color:#fff; font-weight:500; flex:1; }
    .ch-switch { position:relative; width:44px; height:24px; flex-shrink:0; }
    .ch-switch input { opacity:0; width:0; height:0; }
    .ch-slider { position:absolute; cursor:pointer; inset:0; background:rgba(255,255,255,0.1); transition:.3s; border-radius:24px; }
    .ch-slider:before { content:""; position:absolute; height:18px; width:18px; left:3px; bottom:3px; background:#e4e4e7; transition:.3s; border-radius:50%; }
    input:checked + .ch-slider { background:var(--ch-accent); }
    input:checked + .ch-slider:before { transform:translateX(20px); background:#fff; }
    .ch-btn { padding:10px; border-radius:12px; border:1px solid rgba(255,255,255,0.05); background:rgba(255,255,255,0.05); color:#fff; font-family:var(--ch-font); font-size:13px; font-weight:600; cursor:pointer; transition:.2s; }
    .ch-btn-primary { background:var(--ch-accent); color:#121212; border:none; }
    .ch-btn-primary:hover { background:var(--ch-accent-hover); }
    .ch-depth-row { display:flex; align-items:center; gap:10px; }
    .ch-depth-label { font-size:13px; color:#fff; font-weight:500; white-space:nowrap; }
    .ch-depth-val { font-size:13px; color:var(--ch-accent); font-weight:700; min-width:20px; text-align:center; }
    .ch-range { -webkit-appearance:none; appearance:none; flex:1; height:4px; background:rgba(255,255,255,0.15); border-radius:4px; outline:none; cursor:pointer; }
    .ch-range::-webkit-slider-thumb { -webkit-appearance:none; width:16px; height:16px; border-radius:50%; background:var(--ch-accent); cursor:pointer; }
    .ch-range::-moz-range-thumb { width:16px; height:16px; border-radius:50%; background:var(--ch-accent); border:none; cursor:pointer; }
    .ch-shade-overlay { position:absolute; pointer-events:none; z-index:999; border-radius:2px; transition:opacity .2s; }
    .ch-keybind { font-size:11px; color:rgba(255,255,255,0.5); background:rgba(255,255,255,0.08); padding:2px 8px; border-radius:6px; font-family:var(--ch-font); font-weight:600; letter-spacing:0.5px; cursor:pointer; transition:.2s; }
    .ch-keybind:hover { color:#fff; background:rgba(255,255,255,0.15); }
    .ch-keybind.recording { color:var(--ch-accent); background:rgba(129,182,76,0.15); animation:ch-pulse 1s infinite; }
    @keyframes ch-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
    .ch-info { width:16px; height:16px; border-radius:50%; border:1.5px solid rgba(255,255,255,0.3); color:rgba(255,255,255,0.4); font-size:10px; font-weight:700; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; transition:.2s; font-style:italic; font-family:serif; line-height:1; }
    .ch-info:hover { border-color:var(--ch-accent); color:var(--ch-accent); }
    .ch-tooltip { display:none; background:rgba(10,10,12,0.95); border:1px solid var(--ch-border); border-radius:10px; padding:8px 12px; font-size:11px; color:rgba(255,255,255,0.7); line-height:1.5; margin-top:4px; }
    .ch-tooltip.show { display:block; }
    .ch-thinking { font-size:12px; color:var(--ch-accent); font-weight:600; text-align:center; animation:ch-pulse 1.2s infinite; display:none; }
    .ch-thinking.active { display:block; }
  `;
  document.head.appendChild(style);

  window.chessHelper = { autoPlay: false, showArrow: false, hiddenArrow: false, showOpponent: false, showEval: false };

  const pieceToFen = { 'wp':'P','wn':'N','wb':'B','wr':'R','wq':'Q','wk':'K', 'bp':'p','bn':'n','bb':'b','br':'r','bq':'q','bk':'k' };

  function getBoard() { return document.querySelector('wc-chess-board') || document.querySelector('chess-board') || document.querySelector('.board'); }
  function getMyColor() { const b = getBoard(); return b?.classList.contains('flipped') ? 'b' : 'w'; }

  function inActiveGame() {
    const b = getBoard();
    if (!b) return false;
    if (document.querySelector('.move-list-wrapper, .vertical-move-list, wc-move-list, [class*="move-list"]')) return true;
    const clocks = document.querySelectorAll('.clock-component, .clock-bottom, .clock-top');
    const running = [...clocks].some(c => c.classList.contains('clock-player-turn'));
    if (running) return true;
    if (b.game?.getTurn && b.game?.getPlayingAs) {
      try { const fen = b.game.getFEN(); if (fen && !fen.startsWith('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w')) return true; } catch {}
    }
    return false;
  }

  function isMyTurn() {
    const b = getBoard();
    if (b?.game?.getFEN) {
      const fen = b.game.getFEN();
      const turn = fen.split(' ')[1];
      return turn === getMyColor();
    }
    const bottom = document.querySelector('.clock-bottom');
    if (bottom && bottom.classList.contains('clock-player-turn')) return true;
    const top = document.querySelector('.clock-top');
    if (top && top.classList.contains('clock-player-turn')) return false;
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
      console.log('SF19 WASM ready (depth ' + ENGINE_DEPTH + ', MultiPV ' + MULTI_PV + ')');
    } catch (e) {
      console.warn('WASM failed, ASM fallback:', e.message);
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
        console.error('Both engines failed:', e2);
        sfWorker = null;
      }
    }
  }

  function uciSend(cmd) {
    if (sfWorker) sfWorker.postMessage(cmd);
  }

  function uciCommand(cmd, waitFor) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => { reject(new Error('UCI timeout')); }, 10000);
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
      }, 8000);
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
      if (count < REPEAT_THRESHOLD) return c;
    }
    return candidates[0];
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
        pointerId: 1, isPrimary: true, pointerType: 'mouse'
      }));
    }
  }

  function isPromotion(fen, from, to) {
    const rank = to[1];
    if (rank !== '8' && rank !== '1') return false;
    const parts = (fen || '').split(' ');
    const rows = (parts[0] || '').split('/');
    const file = from.charCodeAt(0) - 97;
    const fromRank = parseInt(from[1]);
    const rowIdx = 8 - fromRank;
    if (rowIdx < 0 || rowIdx > 7) return false;
    const row = rows[rowIdx] || '';
    let col = 0;
    for (const ch of row) {
      if (ch >= '1' && ch <= '8') { col += parseInt(ch); }
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
      await new Promise(r => setTimeout(r, 200 + attempt * 100));
      clickSquare(to);
      await new Promise(r => setTimeout(r, 300));
      if (needsPromo) {
        const color = getMyColor() || 'w';
        for (let pi = 0; pi < 8; pi++) {
          const promoWin = document.querySelector('.promotion-window, .promotion-area, [class*="promotion"]');
          if (!promoWin) { await new Promise(r => setTimeout(r, 150)); continue; }
          const el = promoWin.querySelector(`.${color}${promoChar}, [class*="${color}${promoChar}"], [data-piece="${promoChar}"], [data-piece="${color}${promoChar}"]`)
            || promoWin.querySelector(`[class*="${promoChar}"]`)
            || promoWin.querySelector('[class*="queen"], [data-piece="q"], [data-piece="wq"], [data-piece="bq"]')
            || promoWin.children[0];
          if (el) {
            const r = el.getBoundingClientRect();
            const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
            for (const type of ['pointerdown', 'pointerup', 'click']) {
              const Cls = type === 'click' ? MouseEvent : PointerEvent;
              el.dispatchEvent(new Cls(type, { bubbles: true, cancelable: true, view: window, clientX: cx, clientY: cy, button: 0, buttons: type === 'pointerdown' ? 1 : 0, pointerId: 1, isPrimary: true, pointerType: 'mouse' }));
            }
            break;
          }
          await new Promise(r => setTimeout(r, 150));
        }
        await new Promise(r => setTimeout(r, 300));
      }
      if (getFEN() !== fenBefore) break;
    }
  }

  function clearArrows() {
    drawing = true;
    const b = getBoard();
    try { if (b?.game?.markings?.removeAll) b.game.markings.removeAll(); } catch {}
    document.querySelectorAll('.ch-arrow-svg').forEach(e => e.remove());
    drawing = false;
  }

  function clearShading() {
    drawing = true;
    document.querySelectorAll('.ch-shade-overlay').forEach(e => e.remove());
    drawing = false;
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
    drawing = true;
    const from = move.slice(0, 2), to = move.slice(2, 4);
    const flipped = b.classList.contains('flipped');
    const s = squareToPct(from, flipped);
    const e = squareToPct(to, flipped);
    const dx = e.x - s.x, dy = e.y - s.y;
    const len = Math.hypot(dx, dy);
    if (len < 0.5) { drawing = false; return; }
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
    drawing = false;
  }

  function drawNativeArrow(move) {
    clearArrows();
    const b = getBoard(); if (!b || !move) return;
    const from = move.slice(0, 2), to = move.slice(2, 4);
    try {
      if (b.game?.markings?.addMany) {
        drawing = true;
        b.game.markings.addMany([{ data: { from, to, color: '#96bc4b', opacity: 0.8 }, type: 'arrow' }]);
        drawing = false;
        return;
      }
    } catch { drawing = false; }
    drawArrowSVG(b, move, '#96bc4b', '0.8', 'ch-arrow-svg', 1000);
  }

  function clearOpponentArrow() {
    drawing = true;
    document.querySelectorAll('.ch-opponent-svg').forEach(e => e.remove());
    drawing = false;
  }

  function drawOpponentArrow(move) {
    clearOpponentArrow();
    const b = getBoard(); if (!b || !move) return;
    drawArrowSVG(b, move, '#e04040', '0.8', 'ch-opponent-svg', 1002);
  }

  function cpToWinPct(cp) {
    if (cp === null || cp === undefined) return 50;
    return Math.round(100 / (1 + Math.exp(-0.00368208 * cp)));
  }
  function updateEval(cp, myColor) {
    const bar = document.getElementById('ch-eval-white');
    const top = document.getElementById('ch-eval-pct-top');
    const bot = document.getElementById('ch-eval-pct-bot');
    if (!bar || !top || !bot) return;
    let whitePct = cpToWinPct(cp);
    const myPct = myColor === 'w' ? whitePct : 100 - whitePct;
    const oppPct = 100 - myPct;
    bar.style.height = whitePct + '%';
    top.textContent = (100 - whitePct) + '%';
    bot.textContent = whitePct + '%';
  }

  let processing = false, lastFen = '', lastMovedFen = '', drawing = false, lastOppFen = '', lastOppMove = null;
  async function tick() {
    if ((!window.chessHelper.autoPlay && !window.chessHelper.showArrow && !window.chessHelper.hiddenArrow && !window.chessHelper.showOpponent) || processing) return;
    if (!inActiveGame()) return;
    const myTurn = isMyTurn();
    if (!myTurn) {
      lastFen = '';
      processing = true;
      clearArrows();
      clearShading();
      const fen = getFEN();
      if (fen && window.chessHelper.showOpponent) {
        if (fen === lastOppFen && lastOppMove) { drawOpponentArrow(lastOppMove); processing = false; return; }
        try {
          const candidates = await queryLocal(fen, ENGINE_DEPTH);
          const om = candidates.length ? candidates[0].move : null;
          if (candidates.length && candidates[0].cp !== null) {
            updateEval(-candidates[0].cp, getMyColor());
          }
          lastOppFen = fen;
          lastOppMove = om;
          if (om) drawOpponentArrow(om);
          else clearOpponentArrow();
        } catch {} finally { processing = false; }
      } else { clearOpponentArrow(); processing = false; }
      return;
    }
    lastOppFen = ''; lastOppMove = null;
    const fen = getFEN(); if (!fen) return;
    if (fen === lastFen) return;
    if (window.chessHelper.autoPlay && fen === lastMovedFen) return;

    processing = true;
    thinkingEl.classList.add('active');
    try {
      const result = await fetchRemote(fen);
      thinkingEl.classList.remove('active');
      if (!result) return;
      const mv = result.move;
      updateEval(result.cp, getMyColor());
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
        }
        if (!window.chessHelper.autoPlay) return;
        recordMove(fen, mv);
        await makeMove(mv);
        const fenAfter = getFEN();
        if (fenAfter !== fen) {
          lastMovedFen = fenAfter;
        } else {
          lastFen = '';
        }
      }
    } catch {} finally { processing = false; thinkingEl.classList.remove('active'); }
  }

  const obs = new MutationObserver(() => { if (!drawing && (window.chessHelper.autoPlay || window.chessHelper.showArrow || window.chessHelper.hiddenArrow || window.chessHelper.showOpponent)) tick(); });
  function watch() {
    const b = getBoard();
    if (b) obs.observe(b, { childList:true, subtree:true, attributes:true });
    else setTimeout(watch, 1000);
  }
  watch();
  setInterval(tick, 500);

  // UI
  const root = document.createElement('div'); root.id = 'chess-helper-root';
  const bubble = document.createElement('div'); bubble.id = 'chess-helper-bubble';
  bubble.innerHTML = `<img src="https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wn.png" draggable="false">`;
  const panel = document.createElement('div'); panel.id = 'chess-helper-panel';
  panel.innerHTML = `
    <div class="ch-header"><div class="ch-title">Chess Assist</div><button class="ch-close" id="ch-close">&times;</button></div>
    <div class="ch-thinking" id="ch-thinking">Thinking...</div>
    <div>
      <div class="ch-depth-row"><span class="ch-depth-label">Depth</span><span class="ch-info" data-tip="depth">i</span><input type="range" class="ch-range" id="ch-depth" min="1" max="24" value="16"><span class="ch-depth-val" id="ch-depth-val">16</span></div>
      <div class="ch-tooltip" id="tip-depth">How many moves ahead the engine calculates. Higher = stronger but slower. 16 is a good balance. Below 10 is fast but weaker, above 20 is very slow.</div>
    </div>
    <div>
      <div class="ch-row"><span class="ch-label">Show best move</span><span class="ch-info" data-tip="arrow">i</span><span class="ch-keybind" data-bind="arrow">Press keys...</span><label class="ch-switch"><input type="checkbox" id="ch-arrow"><span class="ch-slider"></span></label></div>
      <div class="ch-tooltip" id="tip-arrow">Draws a green arrow on the board showing the best move the engine found.</div>
    </div>
    <div>
      <div class="ch-row"><span class="ch-label">Hidden arrows</span><span class="ch-info" data-tip="hidden">i</span><span class="ch-keybind" data-bind="hidden">Press keys...</span><label class="ch-switch"><input type="checkbox" id="ch-hidden"><span class="ch-slider"></span></label></div>
      <div class="ch-tooltip" id="tip-hidden">Instead of a visible arrow, subtly darkens the piece square and target square. Hard to notice unless you know what to look for. Overrides the green arrow when both are on.</div>
    </div>
    <div>
      <div class="ch-row"><span class="ch-label">Auto-play</span><span class="ch-info" data-tip="auto">i</span><span class="ch-keybind" data-bind="auto">Press keys...</span><label class="ch-switch"><input type="checkbox" id="ch-auto"><span class="ch-slider"></span></label></div>
      <div class="ch-tooltip" id="tip-auto">Automatically plays the best move for you when it's your turn. Uses anti-repetition to avoid repeating the same moves.</div>
    </div>
    <div>
      <div class="ch-row"><span class="ch-label">Move delay</span><span class="ch-info" data-tip="delay">i</span><span class="ch-keybind" data-bind="delay">Press keys...</span><label class="ch-switch"><input type="checkbox" id="ch-delay-toggle"><span class="ch-slider"></span></label></div>
      <div class="ch-tooltip" id="tip-delay">Random delay before auto-play makes a move, so it looks like a human thinking. Set a min and max range in seconds. Off by default — the engine moves as soon as it finishes calculating.</div>
      <div id="ch-delay-sliders" style="display:none">
        <div class="ch-depth-row" style="margin-top:6px"><span class="ch-depth-label">Min</span><input type="range" class="ch-range" id="ch-delay-min" min="0" max="15" value="1" step="0.5"><span class="ch-depth-val" id="ch-delay-min-val">1s</span></div>
        <div class="ch-depth-row" style="margin-top:4px"><span class="ch-depth-label">Max</span><input type="range" class="ch-range" id="ch-delay-max" min="0" max="15" value="5" step="0.5"><span class="ch-depth-val" id="ch-delay-max-val">5s</span></div>
      </div>
    </div>
    <div>
      <div class="ch-row"><span class="ch-label">Opponent's best</span><span class="ch-info" data-tip="opponent">i</span><span class="ch-keybind" data-bind="opponent">Press keys...</span><label class="ch-switch"><input type="checkbox" id="ch-opponent"><span class="ch-slider"></span></label></div>
      <div class="ch-tooltip" id="tip-opponent">Shows a red arrow for the opponent's best reply to the current position. Helps you anticipate what they'll play next.</div>
    </div>
    <div>
      <div class="ch-row"><span class="ch-label">Win percent</span><span class="ch-info" data-tip="eval">i</span><span class="ch-keybind" data-bind="eval">Press keys...</span><label class="ch-switch"><input type="checkbox" id="ch-eval"><span class="ch-slider"></span></label></div>
      <div class="ch-tooltip" id="tip-eval">Shows a live win probability bar next to the panel. Updates every position using Stockfish's centipawn evaluation.</div>
    </div>
    <button class="ch-btn ch-btn-primary" id="ch-analyze">Analyze once</button>
    <div>
      <div class="ch-row" style="margin-top:2px"><span class="ch-label">Hide all</span><span class="ch-info" data-tip="hide">i</span><span class="ch-keybind" data-bind="hide">Press keys...</span></div>
      <div class="ch-tooltip" id="tip-hide">Hides everything — the icon, panel, arrows, and shading. Press your keybind again to bring it all back.</div>
    </div>
  `;
  const wrap = document.createElement('div'); wrap.id = 'chess-helper-wrap';
  const evalBar = document.createElement('div'); evalBar.id = 'ch-eval-bar';
  evalBar.innerHTML = `<div id="ch-eval-pct-top" class="ch-eval-pct">50%</div><div id="ch-eval-white"></div><div id="ch-eval-pct-bot" class="ch-eval-pct">50%</div>`;
  evalBar.style.display = 'none';
  wrap.append(panel, evalBar);
  root.append(bubble, wrap); document.body.appendChild(root);

  panel.querySelectorAll('.ch-info[data-tip]').forEach(el => {
    el.onclick = () => {
      const tip = panel.querySelector('#tip-' + el.dataset.tip);
      if (tip) tip.classList.toggle('show');
    };
  });

  const thinkingEl = panel.querySelector('#ch-thinking');
  panel.querySelector('#ch-close').onclick = () => wrap.classList.remove('visible');

  let ox = window.innerWidth - 80, oy = 80, dragging = false, dragMoved = false, sx = 0, sy = 0;
  function setPos() { bubble.style.transform = `translate3d(${ox}px,${oy}px,0)`; }
  setPos();
  bubble.onmousedown = bubble.ontouchstart = (e) => {
    dragging = true; dragMoved = false;
    const p = e.touches ? e.touches[0] : e;
    sx = p.clientX - ox; sy = p.clientY - oy;
  };
  document.onmousemove = document.ontouchmove = (e) => {
    if (!dragging) return; dragMoved = true;
    const p = e.touches ? e.touches[0] : e;
    ox = Math.max(0, Math.min(p.clientX - sx, innerWidth - 52));
    oy = Math.max(0, Math.min(p.clientY - sy, innerHeight - 52));
    setPos();
  };
  document.onmouseup = document.ontouchend = () => {
    if (!dragging) return;
    dragging = false;
    if (!dragMoved) { wrap.classList.toggle('visible'); positionPanel(); }
  };

  let panelX = -1, panelY = -1, panelDragging = false, panelDragMoved = false, panelSX = 0, panelSY = 0;

  function positionPanel() {
    if (panelX < 0) {
      const panelW = 280;
      panelX = ox + 60;
      panelY = oy;
      if (panelX + panelW > innerWidth) panelX = ox - panelW - 10;
      if (panelY + 300 > innerHeight) panelY = innerHeight - 310;
    }
    panelX = Math.max(0, Math.min(panelX, innerWidth - 280));
    panelY = Math.max(0, Math.min(panelY, innerHeight - 50));
    wrap.style.left = panelX + 'px'; wrap.style.top = panelY + 'px';
  }

  const header = panel.querySelector('.ch-header');
  header.addEventListener('mousedown', (e) => {
    panelDragging = true; panelDragMoved = false;
    panelSX = e.clientX - panelX; panelSY = e.clientY - panelY;
    e.preventDefault();
  });
  header.addEventListener('touchstart', (e) => {
    panelDragging = true; panelDragMoved = false;
    const t = e.touches[0];
    panelSX = t.clientX - panelX; panelSY = t.clientY - panelY;
  });
  document.addEventListener('mousemove', (e) => {
    if (!panelDragging) return; panelDragMoved = true;
    panelX = e.clientX - panelSX; panelY = e.clientY - panelSY;
    positionPanel();
  });
  document.addEventListener('touchmove', (e) => {
    if (!panelDragging) return; panelDragMoved = true;
    const t = e.touches[0];
    panelX = t.clientX - panelSX; panelY = t.clientY - panelSY;
    positionPanel();
  });
  document.addEventListener('mouseup', () => { panelDragging = false; });
  document.addEventListener('touchend', () => { panelDragging = false; });

  const _obs2 = new MutationObserver(() => { if (panel.classList.contains('visible')) positionPanel(); });
  _obs2.observe(panel, { attributes: true, attributeFilter: ['class'] });

  panel.querySelector('#ch-depth').oninput = (e) => {
    ENGINE_DEPTH = parseInt(e.target.value);
    panel.querySelector('#ch-depth-val').textContent = ENGINE_DEPTH;
  };
  panel.querySelector('#ch-delay-toggle').onchange = (e) => {
    DELAY_ENABLED = e.target.checked;
    panel.querySelector('#ch-delay-sliders').style.display = e.target.checked ? '' : 'none';
  };
  const delayMinSlider = panel.querySelector('#ch-delay-min');
  const delayMaxSlider = panel.querySelector('#ch-delay-max');
  const delayMinVal = panel.querySelector('#ch-delay-min-val');
  const delayMaxVal = panel.querySelector('#ch-delay-max-val');
  delayMinSlider.oninput = (e) => {
    DELAY_MIN = parseFloat(e.target.value);
    if (DELAY_MIN > DELAY_MAX) { DELAY_MAX = DELAY_MIN; delayMaxSlider.value = DELAY_MAX; delayMaxVal.textContent = DELAY_MAX + 's'; }
    delayMinVal.textContent = DELAY_MIN + 's';
  };
  delayMaxSlider.oninput = (e) => {
    DELAY_MAX = parseFloat(e.target.value);
    if (DELAY_MAX < DELAY_MIN) { DELAY_MIN = DELAY_MAX; delayMinSlider.value = DELAY_MIN; delayMinVal.textContent = DELAY_MIN + 's'; }
    delayMaxVal.textContent = DELAY_MAX + 's';
  };
  panel.querySelector('#ch-arrow').onchange = (e) => {
    window.chessHelper.showArrow = e.target.checked;
    if (!e.target.checked) clearArrows();
    else { lastFen = ''; tick(); }
  };
  panel.querySelector('#ch-hidden').onchange = (e) => {
    window.chessHelper.hiddenArrow = e.target.checked;
    if (!e.target.checked) clearShading();
    else { lastFen = ''; tick(); }
  };
  panel.querySelector('#ch-auto').onchange = (e) => {
    window.chessHelper.autoPlay = e.target.checked;
    if (e.target.checked) { lastFen = ''; lastMovedFen = ''; tick(); }
  };
  panel.querySelector('#ch-analyze').onclick = async () => {
    const btn = panel.querySelector('#ch-analyze');
    btn.textContent = 'Analyzing...';
    thinkingEl.classList.add('active');
    if (!inActiveGame()) { btn.textContent = 'No Game'; thinkingEl.classList.remove('active'); setTimeout(() => btn.textContent = 'Analyze once', 1500); return; }
    let fen = getFEN();
    if (!fen) { btn.textContent = 'No Game'; thinkingEl.classList.remove('active'); setTimeout(() => btn.textContent = 'Analyze once', 1500); return; }
    if (!isMyTurn() && !window.chessHelper.showOpponent) { btn.textContent = 'Not your turn'; thinkingEl.classList.remove('active'); setTimeout(() => btn.textContent = 'Analyze once', 1500); return; }
    if (!isMyTurn()) {
      const candidates = await queryLocal(fen, ENGINE_DEPTH);
      const om = candidates.length ? candidates[0].move : null;
      thinkingEl.classList.remove('active');
      if (om) { drawOpponentArrow(om); btn.textContent = `Opp: ${om.toUpperCase()}`; }
      else btn.textContent = 'Error';
      setTimeout(() => btn.textContent = 'Analyze once', 2500);
      return;
    }
    const result = await fetchRemote(fen);
    thinkingEl.classList.remove('active');
    if (result) {
      updateEval(result.cp, getMyColor());
      if (window.chessHelper.hiddenArrow) { drawShading(result.move); clearArrows(); }
      else { drawNativeArrow(result.move); }
      btn.textContent = `Best: ${result.move.toUpperCase()}`;
    }
    else btn.textContent = 'Error';
    setTimeout(() => btn.textContent = 'Analyze once', 2500);
  };
  panel.querySelector('#ch-opponent').onchange = (e) => {
    window.chessHelper.showOpponent = e.target.checked;
    if (!e.target.checked) clearOpponentArrow();
    else { lastFen = ''; tick(); }
  };
  panel.querySelector('#ch-eval').onchange = (e) => {
    window.chessHelper.showEval = e.target.checked;
    evalBar.style.display = e.target.checked ? '' : 'none';
  };

  let uiHidden = false;
  let autoPlayBeforeHide = false;
  function toggleUI() {
    uiHidden = !uiHidden;
    root.style.display = uiHidden ? 'none' : '';
    if (uiHidden) {
      clearArrows(); clearShading(); clearOpponentArrow();
      autoPlayBeforeHide = window.chessHelper.autoPlay;
      if (autoPlayBeforeHide) {
        window.chessHelper.autoPlay = false;
        panel.querySelector('#ch-auto').checked = false;
      }
    } else {
      if (autoPlayBeforeHide) {
        window.chessHelper.autoPlay = true;
        panel.querySelector('#ch-auto').checked = true;
      }
      lastFen = ''; tick();
    }
  }

  const binds = { hide: null, arrow: null, hidden: null, auto: null, delay: null, opponent: null, eval: null };
  let recordingBind = null;
  let recordingHeldMods = null;

  const KEY_NAMES = { ' ': 'Space', 'ArrowUp': 'Up', 'ArrowDown': 'Down', 'ArrowLeft': 'Left', 'ArrowRight': 'Right', 'Backspace': 'Backspace', 'Delete': 'Delete', 'Enter': 'Enter', 'Tab': 'Tab', 'CapsLock': 'CapsLock', 'Insert': 'Insert', 'Home': 'Home', 'End': 'End', 'PageUp': 'PgUp', 'PageDown': 'PgDn' };
  const MODS = new Set(['Control','Shift','Alt','Meta']);

  function prettyKey(key) {
    if (KEY_NAMES[key]) return KEY_NAMES[key];
    if (key.length === 1) return key.toUpperCase();
    return key;
  }

  function liveLabel(e) {
    const parts = [];
    if (e.ctrlKey) parts.push('Ctrl');
    if (e.altKey) parts.push('Alt');
    if (e.shiftKey) parts.push('Shift');
    if (e.metaKey) parts.push('Win');
    if (!MODS.has(e.key)) parts.push(prettyKey(e.key));
    return parts.join('+') || 'Press keys...';
  }

  function keyLabel(k) {
    if (!k) return 'Press keys...';
    const parts = [];
    if (k.ctrl) parts.push('Ctrl');
    if (k.alt) parts.push('Alt');
    if (k.shift) parts.push('Shift');
    if (k.meta) parts.push('Win');
    if (k.key) parts.push(prettyKey(k.key));
    return parts.join('+') || 'Press keys...';
  }

  function matchesKey(e, k) {
    if (!k) return false;
    if (k.key) {
      return e.ctrlKey === !!k.ctrl && e.altKey === !!k.alt && e.shiftKey === !!k.shift && e.metaKey === !!k.meta && e.key.toLowerCase() === k.key.toLowerCase();
    }
    return false;
  }

  function bindFingerprint(k) {
    if (!k) return '';
    const parts = [];
    if (k.ctrl) parts.push('c');
    if (k.alt) parts.push('a');
    if (k.shift) parts.push('s');
    if (k.meta) parts.push('m');
    if (k.key) parts.push(k.key.toLowerCase());
    return parts.join('|');
  }

  function cancelRecording() {
    if (!recordingBind) return;
    recordingBind.el.textContent = keyLabel(binds[recordingBind.name]);
    recordingBind.el.classList.remove('recording');
    recordingBind = null;
  }

  function commitBind(newKey) {
    const name = recordingBind.name;
    const fp = bindFingerprint(newKey);
    for (const [other, k] of Object.entries(binds)) {
      if (other !== name && k && bindFingerprint(k) === fp) {
        binds[other] = null;
        const otherEl = panel.querySelector(`.ch-keybind[data-bind="${other}"]`);
        if (otherEl) otherEl.textContent = 'Press keys...';
      }
    }
    binds[name] = newKey;
    recordingBind.el.textContent = keyLabel(newKey);
    recordingBind.el.classList.remove('recording');
    recordingBind = null;
  }

  panel.querySelectorAll('.ch-keybind[data-bind]').forEach(el => {
    el.onclick = (ev) => {
      ev.stopPropagation();
      if (recordingBind && recordingBind.el === el) { cancelRecording(); return; }
      cancelRecording();
      recordingBind = { name: el.dataset.bind, el };
      el.textContent = 'Press keys...';
      el.classList.add('recording');
    };
  });

  document.addEventListener('click', (e) => {
    if (recordingBind && !e.target.closest('.ch-keybind')) cancelRecording();
  });

  function toggleBind(name) {
    const map = { arrow: '#ch-arrow', hidden: '#ch-hidden', auto: '#ch-auto', delay: '#ch-delay-toggle', opponent: '#ch-opponent', eval: '#ch-eval' };
    const cb = panel.querySelector(map[name]);
    if (!cb) return;
    cb.checked = !cb.checked;
    cb.dispatchEvent(new Event('change'));
  }

  let soloModKey = null;
  let soloModTime = 0;

  function matchModOnly(e, k) {
    if (!k || k.key) return false;
    return (!!k.ctrl === (e.key === 'Control')) && (!!k.alt === (e.key === 'Alt')) && (!!k.shift === (e.key === 'Shift')) && (!!k.meta === (e.key === 'Meta'));
  }

  function fireModBind(name) {
    if (name === 'hide') { toggleUI(); return true; }
    toggleBind(name); return true;
  }

  document.addEventListener('keydown', (e) => {
    if (recordingBind) {
      if (e.key === 'Escape') { cancelRecording(); return; }
      e.preventDefault(); e.stopPropagation();
      recordingBind.el.textContent = liveLabel(e);
      if (MODS.has(e.key)) {
        recordingHeldMods = { ctrl: e.ctrlKey || e.key === 'Control', alt: e.altKey || e.key === 'Alt', shift: e.shiftKey || e.key === 'Shift', meta: e.metaKey || e.key === 'Meta', key: null };
      } else {
        recordingHeldMods = null;
        commitBind({ ctrl: e.ctrlKey, shift: e.shiftKey, alt: e.altKey, meta: e.metaKey, key: e.key });
      }
      return;
    }
    if (MODS.has(e.key)) {
      soloModKey = e.key;
      soloModTime = Date.now();
    } else {
      soloModKey = null;
    }
    if (matchesKey(e, binds.hide)) { e.preventDefault(); toggleUI(); return; }
    if (matchesKey(e, binds.arrow)) { e.preventDefault(); toggleBind('arrow'); return; }
    if (matchesKey(e, binds.hidden)) { e.preventDefault(); toggleBind('hidden'); return; }
    if (matchesKey(e, binds.auto)) { e.preventDefault(); toggleBind('auto'); return; }
    if (matchesKey(e, binds.delay)) { e.preventDefault(); toggleBind('delay'); return; }
    if (matchesKey(e, binds.opponent)) { e.preventDefault(); toggleBind('opponent'); return; }
    if (matchesKey(e, binds.eval)) { e.preventDefault(); toggleBind('eval'); return; }
  });

  document.addEventListener('keyup', (e) => {
    if (recordingBind && recordingHeldMods) {
      commitBind(recordingHeldMods);
      recordingHeldMods = null;
      return;
    }
    if (!MODS.has(e.key) || !soloModKey) return;
    if (e.key !== soloModKey) { soloModKey = null; return; }
    if (Date.now() - soloModTime > 1000) { soloModKey = null; return; }
    soloModKey = null;
    for (const name of ['hide', 'arrow', 'hidden', 'auto', 'delay', 'opponent', 'eval']) {
      if (matchModOnly(e, binds[name])) { e.preventDefault(); fireModBind(name); return; }
    }
  });

  console.log('chess helper loaded');
})();
