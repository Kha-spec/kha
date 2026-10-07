// Controller điều khiển giao diện CyberChess Master
document.addEventListener('DOMContentLoaded', () => {
  const game = new ChessGame();
  let selectedSquare = null;
  let legalMovesForSelected = [];
  let isFlipped = false;
  let gameMode = 'ai'; // 'ai' hoặc 'human'
  let aiLevel = 2; // 1, 2, 3
  let pendingPromotion = null; // Lưu move chờ chọn phong cấp
  let isAIThinking = false;

  // Đồng hồ tính giờ (giây)
  let timeWhite = 600;
  let timeBlack = 600;
  let timerInterval = null;

  // Ký hiệu Unicode quân cờ cách điệu
  const PIECE_SYMBOLS = {
    wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
    bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟'
  };

  // DOM Elements
  const boardEl = document.getElementById('board');
  const alertBanner = document.getElementById('alert-banner');
  const alertText = document.getElementById('alert-text');
  const movesHistoryEl = document.getElementById('moves-history');
  const moveCountEl = document.getElementById('move-count');
  const statusBadge = document.getElementById('game-status-badge');
  const capturedWhiteEl = document.getElementById('captured-by-white');
  const capturedBlackEl = document.getElementById('captured-by-black');
  const evalFill = document.getElementById('eval-fill');
  const whiteAdvEl = document.getElementById('white-adv');
  const blackAdvEl = document.getElementById('black-adv');
  const timerWhiteEl = document.getElementById('timer-white');
  const timerBlackEl = document.getElementById('timer-black');
  const indicatorWhite = document.getElementById('indicator-white');
  const indicatorBlack = document.getElementById('indicator-black');
  const playerWhiteBar = document.getElementById('player-white-bar');
  const playerBlackBar = document.getElementById('player-black-bar');
  const promoModal = document.getElementById('promotion-modal');
  const promoChoices = document.getElementById('promotion-choices');
  const gameoverModal = document.getElementById('gameover-modal');
  const goTitle = document.getElementById('go-title');
  const goDesc = document.getElementById('go-desc');
  const goIcon = document.getElementById('go-icon');

  // Khởi tạo bàn cờ
  function initBoardDOM() {
    boardEl.innerHTML = '';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const sq = document.createElement('div');
        const displayR = isFlipped ? 7 - r : r;
        const displayC = isFlipped ? 7 - c : c;

        sq.className = `square ${(displayR + displayC) % 2 === 0 ? 'light' : 'dark'}`;
        sq.dataset.row = displayR;
        sq.dataset.col = displayC;

        sq.addEventListener('click', () => onSquareClick(displayR, displayC));
        boardEl.appendChild(sq);
      }
    }
    renderBoard();
  }

  // Render các quân cờ và trạng thái
  function renderBoard() {
    const squares = boardEl.querySelectorAll('.square');
    const checkedKing = game.isCheck() ? game.findKing(game.turn) : null;
    const lastMove = game.history.length > 0 ? game.history[game.history.length - 1].move : null;

    squares.forEach(sq => {
      const r = parseInt(sq.dataset.row);
      const c = parseInt(sq.dataset.col);
      const piece = game.getPiece(r, c);

      sq.innerHTML = '';
      sq.classList.remove('selected', 'in-check', 'last-move');

      // Đánh dấu nước đi trước đó
      if (lastMove && ((lastMove.from.r === r && lastMove.from.c === c) || (lastMove.to.r === r && lastMove.to.c === c))) {
        sq.classList.add('last-move');
      }

      // Đánh dấu ô đang được chọn
      if (selectedSquare && selectedSquare.r === r && selectedSquare.c === c) {
        sq.classList.add('selected');
      }

      // Đánh dấu ô Vua bị chiếu
      if (checkedKing && checkedKing.r === r && checkedKing.c === c) {
        sq.classList.add('in-check');
      }

      // Hiển thị gợi ý nước đi
      const legalMove = legalMovesForSelected.find(m => m.to.r === r && m.to.c === c);
      if (legalMove) {
        if (piece || legalMove.isEnPassant) {
          const ring = document.createElement('div');
          ring.className = 'capture-ring';
          sq.appendChild(ring);
        } else {
          const dot = document.createElement('div');
          dot.className = 'move-dot';
          sq.appendChild(dot);
        }
      }

      // Vẽ quân cờ
      if (piece) {
        const pieceEl = document.createElement('div');
        const color = piece[0];
        pieceEl.className = `piece ${color === 'w' ? 'white-piece' : 'black-piece'}`;
        pieceEl.textContent = PIECE_SYMBOLS[piece];
        sq.appendChild(pieceEl);
      }
    });

    updateUIInfo();
  }

  // Xử lý click ô cờ
  function onSquareClick(r, c) {
    if (isAIThinking) return;
    if (gameMode === 'ai' && game.turn === 'b') return; // Đang tới lượt AI

    const piece = game.getPiece(r, c);

    // Nếu đã chọn quân cờ trước đó
    if (selectedSquare) {
      // Bấm vào nước đi hợp lệ
      const move = legalMovesForSelected.find(m => m.to.r === r && m.to.c === c);
      if (move) {
        // Kiểm tra xem có cần phong cấp không
        const movingPiece = game.getPiece(selectedSquare.r, selectedSquare.c);
        if (movingPiece && movingPiece[1] === 'P' && (r === 0 || r === 7)) {
          openPromotionModal(move);
          return;
        }

        executeMove(move);
        selectedSquare = null;
        legalMovesForSelected = [];
        return;
      }

      // Nếu bấm lại vào quân cùng màu -> Đổi quân được chọn
      if (piece && piece[0] === game.turn) {
        selectedSquare = { r, c };
        legalMovesForSelected = game.getLegalMoves().filter(m => m.from.r === r && m.from.c === c);
        sounds.playClick();
        renderBoard();
        return;
      }

      // Bấm ra ngoài ô hợp lệ -> Bỏ chọn
      selectedSquare = null;
      legalMovesForSelected = [];
      renderBoard();
      return;
    }

    // Chưa chọn ô nào: Chọn quân của phe hiện tại
    if (piece && piece[0] === game.turn) {
      selectedSquare = { r, c };
      legalMovesForSelected = game.getLegalMoves().filter(m => m.from.r === r && m.from.c === c);
      sounds.playClick();
      renderBoard();
    }
  }

  // Thực thi nước đi
  function executeMove(move) {
    const isCapture = move.captured || move.isEnPassant;
    
    // Tọa độ để kích hoạt hiệu ứng nổ hạt
    const targetSq = boardEl.querySelector(`[data-row="${move.to.r}"][data-col="${move.to.c}"]`);
    if (targetSq && isCapture) {
      const rect = targetSq.getBoundingClientRect();
      const fxX = rect.left + rect.width / 2;
      const fxY = rect.top + rect.height / 2;
      const color = game.turn === 'w' ? '#00f2fe' : '#ff3366';
      
      if (window.fxSystem) {
        window.fxSystem.explode(fxX, fxY, color, 45);
      }

      // Rung màn hình bàn cờ
      boardEl.classList.remove('shake-effect');
      void boardEl.offsetWidth; // trigger reflow
      boardEl.classList.add('shake-effect');
      setTimeout(() => boardEl.classList.remove('shake-effect'), 400);

      sounds.playCapture();
    } else {
      sounds.playMove();
    }

    game.makeMove(move);
    renderBoard();

    // Kiểm tra trạng thái ván cờ
    checkGameStatus();

    // Nếu đang chơi với AI và tới lượt Đen
    if (gameMode === 'ai' && game.turn === 'b' && !game.isGameOver().over) {
      triggerAIMove();
    }
  }

  // AI suy nghĩ và đi cờ
  function triggerAIMove() {
    isAIThinking = true;
    statusBadge.textContent = 'AI ĐANG SUY NGHĨ...';
    statusBadge.classList.add('ai-thinking');

    const thinkTime = aiLevel === 1 ? 400 : (aiLevel === 2 ? 650 : 900);

    setTimeout(() => {
      const bestMove = game.getBestAIMove(aiLevel);
      if (bestMove) {
        // Nếu AI phong cấp, mặc định lên Hậu
        if (bestMove.promo === undefined && game.getPiece(bestMove.from.r, bestMove.from.c)[1] === 'P' && bestMove.to.r === 7) {
          bestMove.promo = 'Q';
        }
        executeMove(bestMove);
      }
      isAIThinking = false;
      statusBadge.classList.remove('ai-thinking');
    }, thinkTime);
  }

  // Kiểm tra chiếu / chiếu bí / hòa cờ
  function checkGameStatus() {
    const checkState = game.isGameOver();

    if (checkState.over) {
      clearInterval(timerInterval);
      if (checkState.result === 'checkmate') {
        const isPlayerWin = (gameMode === 'ai' && checkState.winner === 'w') || (gameMode === 'human' && checkState.winner === 'w');
        showAlert(`CHIẾU BÍ! BÊN ${checkState.winner === 'w' ? 'TRẮNG' : 'ĐEN'} THẮNG!`, 4000);

        if (window.fxSystem) window.fxSystem.fireworks();
        if (isPlayerWin) sounds.playVictory();
        else sounds.playDefeat();

        setTimeout(() => {
          openGameoverModal(
            checkState.winner === 'w' ? 'BÊN TRẮNG CHIẾN THẮNG!' : 'BÊN ĐEN CHIẾN THẮNG!',
            checkState.winner === 'w' ? 'Đòn chiếu bí ngoạn mục!' : 'Đối thủ đã hạ gục quân Vua.',
            checkState.winner === 'w' ? '👑' : '💀'
          );
        }, 1200);
      } else {
        showAlert('HÒA CỜ (STALEMATE)!', 3500);
        sounds.playMove();
        setTimeout(() => {
          openGameoverModal('HÒA CỜ!', 'Không còn nước đi hợp lệ hoặc bất phân thắng bại.', '🤝');
        }, 1200);
      }
      return;
    }

    if (game.isCheck()) {
      sounds.playCheck();
      showAlert('CHIẾU TƯỚNG!', 1600);
    }
  }

  // Hiển thị Banner cảnh báo
  let alertTimer = null;
  function showAlert(msg, duration = 2000) {
    clearTimeout(alertTimer);
    alertText.textContent = msg;
    alertBanner.classList.remove('hidden');
    alertTimer = setTimeout(() => {
      alertBanner.classList.add('hidden');
    }, duration);
  }

  // Cập nhật các thành phần UI (Lịch sử, Lượt đi, Thanh ưu thế, Quân bị ăn)
  function updateUIInfo() {
    // Lượt đi & Đèn báo
    if (game.turn === 'w') {
      indicatorWhite.classList.add('active');
      indicatorBlack.classList.remove('active');
      playerWhiteBar.classList.add('active-turn');
      playerBlackBar.classList.remove('active-turn');
      timerWhiteEl.classList.add('active');
      timerBlackEl.classList.remove('active');
      statusBadge.textContent = gameMode === 'ai' ? 'LƯỢT CỦA BẠN' : 'LƯỢT BÊN TRẮNG';
    } else {
      indicatorWhite.classList.remove('active');
      indicatorBlack.classList.add('active');
      playerWhiteBar.classList.remove('active-turn');
      playerBlackBar.classList.add('active-turn');
      timerWhiteEl.classList.remove('active');
      timerBlackEl.classList.add('active');
      statusBadge.textContent = gameMode === 'ai' ? 'LƯỢT CỦA AI' : 'LƯỢT BÊN ĐEN';
    }

    // Lịch sử nước đi
    renderMoveHistory();

    // Tính quân bị ăn
    renderCapturedPieces();

    // Thanh đánh giá ưu thế
    const evalScore = game.evaluateBoard();
    const clampedScore = Math.max(-1500, Math.min(1500, evalScore));
    const percentage = ((clampedScore + 1500) / 3000) * 100;
    evalFill.style.width = `${percentage}%`;

    const whiteAdvVal = Math.max(0, Math.round(evalScore / 100));
    const blackAdvVal = Math.max(0, Math.round(-evalScore / 100));
    whiteAdvEl.textContent = `+${whiteAdvVal}`;
    blackAdvEl.textContent = `+${blackAdvVal}`;
  }

  // Render danh sách nước đi đã đi
  function renderMoveHistory() {
    movesHistoryEl.innerHTML = '';
    const moves = game.moveHistory;
    moveCountEl.textContent = `${moves.length} nước`;

    for (let i = 0; i < moves.length; i += 2) {
      const row = document.createElement('div');
      row.className = 'move-row';

      const moveNum = Math.floor(i / 2) + 1;
      row.innerHTML = `
        <span class="move-num">${moveNum}.</span>
        <span class="move-san white">${moves[i]}</span>
        <span class="move-san black">${moves[i + 1] || ''}</span>
      `;
      movesHistoryEl.appendChild(row);
    }
    movesHistoryEl.scrollTop = movesHistoryEl.scrollHeight;
  }

  // Render quân bị bắt
  function renderCapturedPieces() {
    const initialCounts = {
      w: { P: 8, N: 2, B: 2, R: 2, Q: 1 },
      b: { P: 8, N: 2, B: 2, R: 2, Q: 1 }
    };
    const currentCounts = {
      w: { P: 0, N: 0, B: 0, R: 0, Q: 0 },
      b: { P: 0, N: 0, B: 0, R: 0, Q: 0 }
    };

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = game.board[r][c];
        if (p && p[1] !== 'K') {
          currentCounts[p[0]][p[1]]++;
        }
      }
    }

    // Quân trắng bị đen ăn
    capturedBlackEl.innerHTML = '';
    ['Q', 'R', 'B', 'N', 'P'].forEach(type => {
      const lost = initialCounts.w[type] - currentCounts.w[type];
      for (let i = 0; i < lost; i++) {
        const span = document.createElement('span');
        span.textContent = PIECE_SYMBOLS[`w${type}`];
        capturedBlackEl.appendChild(span);
      }
    });

    // Quân đen bị trắng ăn
    capturedWhiteEl.innerHTML = '';
    ['Q', 'R', 'B', 'N', 'P'].forEach(type => {
      const lost = initialCounts.b[type] - currentCounts.b[type];
      for (let i = 0; i < lost; i++) {
        const span = document.createElement('span');
        span.textContent = PIECE_SYMBOLS[`b${type}`];
        capturedWhiteEl.appendChild(span);
      }
    });
  }

  // Đồng hồ đếm giờ
  function startClock() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (game.isGameOver().over) {
        clearInterval(timerInterval);
        return;
      }

      if (game.turn === 'w') {
        timeWhite--;
        if (timeWhite <= 0) {
          clearInterval(timerInterval);
          openGameoverModal('HẾT GIỜ!', 'Bên Trắng hết thời gian. Bên Đen chiến thắng!', '⏳');
        }
      } else {
        timeBlack--;
        if (timeBlack <= 0) {
          clearInterval(timerInterval);
          openGameoverModal('HẾT GIỜ!', 'Bên Đen hết thời gian. Bên Trắng chiến thắng!', '⏳');
        }
      }
      updateTimerDisplay();
    }, 1000);
  }

  function updateTimerDisplay() {
    const format = sec => {
      const m = Math.floor(sec / 60).toString().padStart(2, '0');
      const s = (sec % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    };
    timerWhiteEl.textContent = format(timeWhite);
    timerBlackEl.textContent = format(timeBlack);
  }

  // Modal Phong Cấp (Promotion)
  function openPromotionModal(move) {
    pendingPromotion = move;
    promoChoices.innerHTML = '';
    const choices = ['Q', 'R', 'B', 'N'];
    const color = game.turn;

    choices.forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'promo-btn';
      btn.textContent = PIECE_SYMBOLS[`${color}${t}`];
      btn.onclick = () => {
        promoModal.classList.add('hidden');
        pendingPromotion.promo = t;
        executeMove(pendingPromotion);
        pendingPromotion = null;
        selectedSquare = null;
        legalMovesForSelected = [];
      };
      promoChoices.appendChild(btn);
    });

    promoModal.classList.remove('hidden');
  }

  // Modal Game Over
  function openGameoverModal(title, desc, icon) {
    goTitle.textContent = title;
    goDesc.textContent = desc;
    goIcon.textContent = icon;
    gameoverModal.classList.remove('hidden');
  }

  // Khởi động ván mới
  function newGame() {
    sounds.playClick();
    game.reset();
    timeWhite = 600;
    timeBlack = 600;
    selectedSquare = null;
    legalMovesForSelected = [];
    isAIThinking = false;
    gameoverModal.classList.add('hidden');
    promoModal.classList.add('hidden');
    alertBanner.classList.add('hidden');
    updateTimerDisplay();
    renderBoard();
    startClock();
  }

  // ==================== EVENT LISTENERS ====================
  // Nút Ván Mới
  document.getElementById('btn-new-game').addEventListener('click', newGame);
  document.getElementById('btn-go-replay').addEventListener('click', newGame);

  // Nút Đi Lại (Undo)
  document.getElementById('btn-undo').addEventListener('click', () => {
    sounds.playClick();
    if (isAIThinking) return;

    if (gameMode === 'ai') {
      // Undo cả nước của AI và của người chơi
      game.undoMove();
      game.undoMove();
    } else {
      game.undoMove();
    }
    selectedSquare = null;
    legalMovesForSelected = [];
    renderBoard();
  });

  // Nút Lật Bàn Cờ (Flip)
  document.getElementById('btn-flip').addEventListener('click', () => {
    sounds.playClick();
    isFlipped = !isFlipped;
    initBoardDOM();
  });

  // Nút Toàn Màn Hình (Fullscreen)
  const fullscreenBtn = document.getElementById('btn-fullscreen');
  const fullscreenIcon = document.getElementById('fullscreen-icon');
  fullscreenBtn.addEventListener('click', () => {
    sounds.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('Lỗi mở toàn màn hình:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  });

  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
      fullscreenIcon.textContent = '🗗';
      fullscreenBtn.innerHTML = '<span class="btn-icon" id="fullscreen-icon">🗗</span> Thu Nhỏ';
    } else {
      fullscreenBtn.innerHTML = '<span class="btn-icon" id="fullscreen-icon">⛶</span> Toàn Màn';
    }
  });

  // Nút Bật/Tắt Âm Thanh
  const soundBtn = document.getElementById('btn-sound-toggle');
  const soundIcon = document.getElementById('sound-icon');
  soundBtn.addEventListener('click', () => {
    const isEnabled = sounds.toggle();
    soundIcon.textContent = isEnabled ? '🔊' : '🔇';
    if (isEnabled) sounds.playClick();
  });

  // Chế độ chơi: AI vs Người
  const btnVsAI = document.getElementById('btn-vs-ai');
  const btnVsHuman = document.getElementById('btn-vs-human');
  const blackName = document.getElementById('name-black');
  const blackAvatarIcon = document.getElementById('black-avatar-icon');
  const aiDiffWrapper = document.getElementById('ai-diff-wrapper');

  btnVsAI.addEventListener('click', () => {
    sounds.playClick();
    gameMode = 'ai';
    btnVsAI.classList.add('active');
    btnVsHuman.classList.remove('active');
    aiDiffWrapper.style.display = 'block';
    blackName.textContent = `Cyber AI (Cấp ${aiLevel})`;
    blackAvatarIcon.textContent = '🤖';
    newGame();
  });

  btnVsHuman.addEventListener('click', () => {
    sounds.playClick();
    gameMode = 'human';
    btnVsHuman.classList.add('active');
    btnVsAI.classList.remove('active');
    aiDiffWrapper.style.display = 'none';
    blackName.textContent = 'Người Chơi 2 (Đen)';
    blackAvatarIcon.textContent = '👤';
    newGame();
  });

  // Độ khó AI
  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sounds.playClick();
      document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      aiLevel = parseInt(btn.dataset.level);
      if (gameMode === 'ai') {
        blackName.textContent = `Cyber AI (Cấp ${aiLevel})`;
      }
    });
  });

  // Khởi động ban đầu
  initBoardDOM();
  startClock();
});
