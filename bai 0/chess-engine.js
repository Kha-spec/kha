// Engine Cờ Vua Đỉnh Cao & Thuật toán AI Minimax
class ChessGame {
  constructor() {
    this.reset();
  }

  reset() {
    // Khởi tạo bàn cờ 8x8
    // Hàng 0: Đen, Hàng 7: Trắng
    this.board = [
      ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
      ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
      ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
    ];

    this.turn = 'w'; // 'w' hoặc 'b'
    this.castling = {
      w: { k: true, q: true },
      b: { k: true, q: true }
    };
    this.enPassant = null; // { r, c } ô có thể bị bắt qua đường
    this.halfMoves = 0;
    this.fullMoves = 1;
    this.history = []; // Lưu lại trạng thái để Undo
    this.moveHistory = []; // Lưu ký hiệu cờ (SAN)
  }

  cloneBoard(board) {
    return board.map(row => [...row]);
  }

  getPiece(r, c) {
    if (r < 0 || r > 7 || c < 0 || c > 7) return null;
    return this.board[r][c];
  }

  getColor(piece) {
    return piece ? piece[0] : null;
  }

  getType(piece) {
    return piece ? piece[1] : null;
  }

  isOpponent(p1, p2) {
    if (!p1 || !p2) return false;
    return p1[0] !== p2[0];
  }

  // Tạo ra danh sách tất cả các nước đi thô (pseudo-legal)
  generatePseudoMoves(color = this.turn) {
    const moves = [];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (!p || p[0] !== color) continue;

        const type = p[1];
        switch (type) {
          case 'P':
            this.generatePawnMoves(r, c, color, moves);
            break;
          case 'N':
            this.generateKnightMoves(r, c, color, moves);
            break;
          case 'B':
            this.generateSlidingMoves(r, c, color, [[-1,-1], [-1,1], [1,-1], [1,1]], moves);
            break;
          case 'R':
            this.generateSlidingMoves(r, c, color, [[-1,0], [1,0], [0,-1], [0,1]], moves);
            break;
          case 'Q':
            this.generateSlidingMoves(r, c, color, [
              [-1,-1], [-1,1], [1,-1], [1,1],
              [-1,0], [1,0], [0,-1], [0,1]
            ], moves);
            break;
          case 'K':
            this.generateKingMoves(r, c, color, moves);
            break;
        }
      }
    }
    return moves;
  }

  generatePawnMoves(r, c, color, moves) {
    const dir = color === 'w' ? -1 : 1;
    const startRow = color === 'w' ? 6 : 1;
    const promoRow = color === 'w' ? 0 : 7;

    // Đi thẳng 1 ô
    const forwardR = r + dir;
    if (forwardR >= 0 && forwardR <= 7 && !this.board[forwardR][c]) {
      if (forwardR === promoRow) {
        ['Q', 'R', 'B', 'N'].forEach(promo => {
          moves.push({ from: { r, c }, to: { r: forwardR, c }, promo });
        });
      } else {
        moves.push({ from: { r, c }, to: { r: forwardR, c } });

        // Đi 2 ô từ vị trí ban đầu
        const forward2R = r + dir * 2;
        if (r === startRow && !this.board[forward2R][c]) {
          moves.push({ from: { r, c }, to: { r: forward2R, c }, isDoublePawn: true });
        }
      }
    }

    // Ăn chéo
    [-1, 1].forEach(dc => {
      const targetC = c + dc;
      if (targetC >= 0 && targetC <= 7) {
        const targetP = this.board[forwardR][targetC];
        if (targetP && targetP[0] !== color) {
          if (forwardR === promoRow) {
            ['Q', 'R', 'B', 'N'].forEach(promo => {
              moves.push({ from: { r, c }, to: { r: forwardR, c: targetC }, promo, captured: targetP });
            });
          } else {
            moves.push({ from: { r, c }, to: { r: forwardR, c: targetC }, captured: targetP });
          }
        } else if (this.enPassant && this.enPassant.r === forwardR && this.enPassant.c === targetC) {
          // Bắt tốt qua đường
          moves.push({
            from: { r, c },
            to: { r: forwardR, c: targetC },
            isEnPassant: true,
            captured: `${color === 'w' ? 'b' : 'w'}P`
          });
        }
      }
    });
  }

  generateKnightMoves(r, c, color, moves) {
    const offsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    for (let [dr, dc] of offsets) {
      const tr = r + dr;
      const tc = c + dc;
      if (tr >= 0 && tr <= 7 && tc >= 0 && tc <= 7) {
        const targetP = this.board[tr][tc];
        if (!targetP || targetP[0] !== color) {
          moves.push({ from: { r, c }, to: { r: tr, c: tc }, captured: targetP });
        }
      }
    }
  }

  generateSlidingMoves(r, c, color, directions, moves) {
    for (let [dr, dc] of directions) {
      let tr = r + dr;
      let tc = c + dc;
      while (tr >= 0 && tr <= 7 && tc >= 0 && tc <= 7) {
        const targetP = this.board[tr][tc];
        if (!targetP) {
          moves.push({ from: { r, c }, to: { r: tr, c: tc } });
        } else {
          if (targetP[0] !== color) {
            moves.push({ from: { r, c }, to: { r: tr, c: tc }, captured: targetP });
          }
          break; // Bị cản
        }
        tr += dr;
        tc += dc;
      }
    }
  }

  generateKingMoves(r, c, color, moves) {
    const offsets = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    for (let [dr, dc] of offsets) {
      const tr = r + dr;
      const tc = c + dc;
      if (tr >= 0 && tr <= 7 && tc >= 0 && tc <= 7) {
        const targetP = this.board[tr][tc];
        if (!targetP || targetP[0] !== color) {
          moves.push({ from: { r, c }, to: { r: tr, c: tc }, captured: targetP });
        }
      }
    }

    // Nhập thành
    const row = color === 'w' ? 7 : 0;
    if (r === row && c === 4 && !this.isSquareAttacked(row, 4, color === 'w' ? 'b' : 'w')) {
      // Phía vua (Kingside)
      if (this.castling[color].k && !this.board[row][5] && !this.board[row][6]) {
        if (!this.isSquareAttacked(row, 5, color === 'w' ? 'b' : 'w') &&
            !this.isSquareAttacked(row, 6, color === 'w' ? 'b' : 'w')) {
          moves.push({ from: { r, c }, to: { r: row, c: 6 }, isCastleK: true });
        }
      }
      // Phía hậu (Queenside)
      if (this.castling[color].q && !this.board[row][3] && !this.board[row][2] && !this.board[row][1]) {
        if (!this.isSquareAttacked(row, 3, color === 'w' ? 'b' : 'w') &&
            !this.isSquareAttacked(row, 2, color === 'w' ? 'b' : 'w')) {
          moves.push({ from: { r, c }, to: { r: row, c: 2 }, isCastleQ: true });
        }
      }
    }
  }

  // Kiểm tra 1 ô có bị phe địch tấn công không
  isSquareAttacked(r, c, byColor) {
    // 1. Tốt địch
    const pDir = byColor === 'w' ? 1 : -1; // Nếu địch là trắng, nó tấn công ngược lên r+1
    const pR = r + pDir;
    if (pR >= 0 && pR <= 7) {
      if (c - 1 >= 0 && this.board[pR][c - 1] === `${byColor}P`) return true;
      if (c + 1 <= 7 && this.board[pR][c + 1] === `${byColor}P`) return true;
    }

    // 2. Mã địch
    const knightOffsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    for (let [dr, dc] of knightOffsets) {
      const tr = r + dr;
      const tc = c + dc;
      if (tr >= 0 && tr <= 7 && tc >= 0 && tc <= 7) {
        if (this.board[tr][tc] === `${byColor}N`) return true;
      }
    }

    // 3. Xe / Hậu địch (đường thẳng)
    const straightDirs = [[-1,0], [1,0], [0,-1], [0,1]];
    for (let [dr, dc] of straightDirs) {
      let tr = r + dr;
      let tc = c + dc;
      while (tr >= 0 && tr <= 7 && tc >= 0 && tc <= 7) {
        const p = this.board[tr][tc];
        if (p) {
          if (p === `${byColor}R` || p === `${byColor}Q`) return true;
          break;
        }
        tr += dr;
        tc += dc;
      }
    }

    // 4. Tượng / Hậu địch (đường chéo)
    const diagDirs = [[-1,-1], [-1,1], [1,-1], [1,1]];
    for (let [dr, dc] of diagDirs) {
      let tr = r + dr;
      let tc = c + dc;
      while (tr >= 0 && tr <= 7 && tc >= 0 && tc <= 7) {
        const p = this.board[tr][tc];
        if (p) {
          if (p === `${byColor}B` || p === `${byColor}Q`) return true;
          break;
        }
        tr += dr;
        tc += dc;
      }
    }

    // 5. Vua địch
    const kingOffsets = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    for (let [dr, dc] of kingOffsets) {
      const tr = r + dr;
      const tc = c + dc;
      if (tr >= 0 && tr <= 7 && tc >= 0 && tc <= 7) {
        if (this.board[tr][tc] === `${byColor}K`) return true;
      }
    }

    return false;
  }

  // Tìm vị trí Vua
  findKing(color) {
    const kingPiece = `${color}K`;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (this.board[r][c] === kingPiece) return { r, c };
      }
    }
    return null;
  }

  // Kiểm tra Vua của color có đang bị chiếu không
  isCheck(color = this.turn) {
    const kingPos = this.findKing(color);
    if (!kingPos) return false;
    const opponent = color === 'w' ? 'b' : 'w';
    return this.isSquareAttacked(kingPos.r, kingPos.c, opponent);
  }

  // Lấy các nước đi hợp lệ hoàn toàn (không để vua bị chiếu)
  getLegalMoves(color = this.turn) {
    const pseudo = this.generatePseudoMoves(color);
    const legal = [];

    for (let move of pseudo) {
      this.makeMove(move, true); // Đi thử ảo
      if (!this.isCheck(color)) {
        legal.push(move);
      }
      this.undoMove(true); // Hoàn tác
    }
    return legal;
  }

  // Thực hiện nước đi
  makeMove(move, isSimulated = false) {
    const fromP = this.board[move.from.r][move.from.c];
    const toP = this.board[move.to.r][move.to.c];
    const prevEnPassant = this.enPassant;
    const prevCastling = {
      w: { ...this.castling.w },
      b: { ...this.castling.b }
    };

    // Lưu snapshot vào history
    this.history.push({
      move,
      board: this.cloneBoard(this.board),
      enPassant: prevEnPassant,
      castling: prevCastling,
      turn: this.turn
    });

    // Cập nhật bàn cờ
    this.board[move.from.r][move.from.c] = null;

    if (move.promo) {
      this.board[move.to.r][move.to.c] = `${this.turn}${move.promo}`;
    } else {
      this.board[move.to.r][move.to.c] = fromP;
    }

    // Xử lý bắt tốt qua đường
    if (move.isEnPassant) {
      const capturedPawnRow = this.turn === 'w' ? move.to.r + 1 : move.to.r - 1;
      this.board[capturedPawnRow][move.to.c] = null;
    }

    // Đặt ô En Passant mới nếu đi 2 ô
    if (move.isDoublePawn) {
      const epRow = this.turn === 'w' ? move.from.r - 1 : move.from.r + 1;
      this.enPassant = { r: epRow, c: move.from.c };
    } else {
      this.enPassant = null;
    }

    // Xử lý nhập thành (di chuyển Xe kèm theo)
    if (move.isCastleK) {
      this.board[move.to.r][5] = this.board[move.to.r][7];
      this.board[move.to.r][7] = null;
    } else if (move.isCastleQ) {
      this.board[move.to.r][3] = this.board[move.to.r][0];
      this.board[move.to.r][0] = null;
    }

    // Hủy quyền nhập thành nếu Vua hoặc Xe di chuyển
    if (fromP === 'wK') {
      this.castling.w.k = false;
      this.castling.w.q = false;
    } else if (fromP === 'bK') {
      this.castling.b.k = false;
      this.castling.b.q = false;
    } else if (fromP === 'wR') {
      if (move.from.r === 7 && move.from.c === 0) this.castling.w.q = false;
      if (move.from.r === 7 && move.from.c === 7) this.castling.w.k = false;
    } else if (fromP === 'bR') {
      if (move.from.r === 0 && move.from.c === 0) this.castling.b.q = false;
      if (move.from.r === 0 && move.from.c === 7) this.castling.b.k = false;
    }

    // Xe bị ăn cũng mất quyền
    if (move.to.r === 7 && move.to.c === 0) this.castling.w.q = false;
    if (move.to.r === 7 && move.to.c === 7) this.castling.w.k = false;
    if (move.to.r === 0 && move.to.c === 0) this.castling.b.q = false;
    if (move.to.r === 0 && move.to.c === 7) this.castling.b.k = false;

    // Đổi lượt
    this.turn = this.turn === 'w' ? 'b' : 'w';

    if (!isSimulated) {
      // Tạo ký hiệu SAN
      const san = this.formatSAN(fromP, move, toP);
      this.moveHistory.push(san);
    }
  }

  // Hoàn tác nước đi
  undoMove(isSimulated = false) {
    if (this.history.length === 0) return null;
    const last = this.history.pop();
    this.board = last.board;
    this.enPassant = last.enPassant;
    this.castling = last.castling;
    this.turn = last.turn;

    if (!isSimulated && this.moveHistory.length > 0) {
      this.moveHistory.pop();
    }
    return last.move;
  }

  formatSAN(piece, move, captured) {
    if (move.isCastleK) return 'O-O';
    if (move.isCastleQ) return 'O-O-O';

    const pType = piece[1];
    const cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const fromCol = cols[move.from.c];
    const toSquare = `${cols[move.to.c]}${8 - move.to.r}`;

    let str = '';
    if (pType === 'P') {
      if (captured || move.isEnPassant) {
        str = `${fromCol}x${toSquare}`;
      } else {
        str = toSquare;
      }
      if (move.promo) {
        str += `=${move.promo}`;
      }
    } else {
      str = `${pType}${captured ? 'x' : ''}${toSquare}`;
    }

    if (this.isCheck(this.turn)) {
      str += '+';
    }
    return str;
  }

  isGameOver() {
    const legal = this.getLegalMoves();
    if (legal.length === 0) {
      if (this.isCheck()) {
        return { over: true, result: 'checkmate', winner: this.turn === 'w' ? 'b' : 'w' };
      } else {
        return { over: true, result: 'stalemate', winner: null };
      }
    }
    return { over: false };
  }

  // ==================== BỘ NÃO AI (MINIMAX + ALPHA BETA) ====================
  // Bảng giá trị vị trí (Piece-Square Tables)
  static PST = {
    P: [
      [ 0,  0,  0,  0,  0,  0,  0,  0],
      [50, 50, 50, 50, 50, 50, 50, 50],
      [10, 10, 20, 30, 30, 20, 10, 10],
      [ 5,  5, 10, 25, 25, 10,  5,  5],
      [ 0,  0,  0, 20, 20,  0,  0,  0],
      [ 5, -5,-10,  0,  0,-10, -5,  5],
      [ 5, 10, 10,-20,-20, 10, 10,  5],
      [ 0,  0,  0,  0,  0,  0,  0,  0]
    ],
    N: [
      [-50,-40,-30,-30,-30,-30,-40,-50],
      [-40,-20,  0,  0,  0,  0,-20,-40],
      [-30,  0, 10, 15, 15, 10,  0,-30],
      [-30,  5, 15, 20, 20, 15,  5,-30],
      [-30,  0, 15, 20, 20, 15,  0,-30],
      [-30,  5, 10, 15, 15, 10,  5,-30],
      [-40,-20,  0,  5,  5,  0,-20,-40],
      [-50,-40,-30,-30,-30,-30,-40,-50]
    ],
    B: [
      [-20,-10,-10,-10,-10,-10,-10,-20],
      [-10,  0,  0,  0,  0,  0,  0,-10],
      [-10,  0,  5, 10, 10,  5,  0,-10],
      [-10,  5,  5, 10, 10,  5,  5,-10],
      [-10,  0, 10, 10, 10, 10,  0,-10],
      [-10, 10, 10, 10, 10, 10, 10,-10],
      [-10,  5,  0,  0,  0,  0,  5,-10],
      [-20,-10,-10,-10,-10,-10,-10,-20]
    ],
    R: [
      [ 0,  0,  0,  0,  0,  0,  0,  0],
      [ 5, 10, 10, 10, 10, 10, 10,  5],
      [-5,  0,  0,  0,  0,  0,  0, -5],
      [-5,  0,  0,  0,  0,  0,  0, -5],
      [-5,  0,  0,  0,  0,  0,  0, -5],
      [-5,  0,  0,  0,  0,  0,  0, -5],
      [-5,  0,  0,  0,  0,  0,  0, -5],
      [ 0,  0,  0,  5,  5,  0,  0,  0]
    ],
    Q: [
      [-20,-10,-10, -5, -5,-10,-10,-20],
      [-10,  0,  0,  0,  0,  0,  0,-10],
      [-10,  0,  5,  5,  5,  5,  0,-10],
      [ -5,  0,  5,  5,  5,  5,  0, -5],
      [  0,  0,  5,  5,  5,  5,  0, -5],
      [-10,  5,  5,  5,  5,  5,  0,-10],
      [-10,  0,  5,  0,  0,  0,  0,-10],
      [-20,-10,-10, -5, -5,-10,-10,-20]
    ],
    K: [
      [-30,-40,-40,-50,-50,-40,-40,-30],
      [-30,-40,-40,-50,-50,-40,-40,-30],
      [-30,-40,-40,-50,-50,-40,-40,-30],
      [-30,-40,-40,-50,-50,-40,-40,-30],
      [-20,-30,-30,-40,-40,-30,-30,-20],
      [-10,-20,-20,-20,-20,-20,-20,-10],
      [ 20, 20,  0,  0,  0,  0, 20, 20],
      [ 20, 30, 10,  0,  0, 10, 30, 20]
    ]
  };

  static PIECE_VALUES = {
    P: 100,
    N: 320,
    B: 330,
    R: 500,
    Q: 900,
    K: 20000
  };

  // Đánh giá điểm thế cờ hiện tại (Dương: Trắng ưu, Âm: Đen ưu)
  evaluateBoard() {
    let score = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (!p) continue;

        const color = p[0];
        const type = p[1];
        let val = ChessGame.PIECE_VALUES[type];
        
        // Giá trị vị trí
        const pst = ChessGame.PST[type];
        const pstVal = color === 'w' ? pst[r][c] : pst[7 - r][c];
        val += pstVal;

        if (color === 'w') {
          score += val;
        } else {
          score -= val;
        }
      }
    }
    return score;
  }

  // Thuật toán Minimax kết hợp tỉa cành Alpha-Beta
  minimax(depth, alpha, beta, isMaximizing) {
    if (depth === 0) {
      return this.evaluateBoard();
    }

    const legal = this.getLegalMoves();
    if (legal.length === 0) {
      if (this.isCheck()) {
        return isMaximizing ? -99999 + (4 - depth) : 99999 - (4 - depth);
      }
      return 0; // Hòa cờ
    }

    // Sắp xếp nước đi để tỉa cành nhanh hơn (Ưu tiên nước ăn quân)
    legal.sort((a, b) => (b.captured ? 1 : 0) - (a.captured ? 1 : 0));

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let move of legal) {
        this.makeMove(move, true);
        const evalScore = this.minimax(depth - 1, alpha, beta, false);
        this.undoMove(true);
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break; // Cắt tỉa
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let move of legal) {
        this.makeMove(move, true);
        const evalScore = this.minimax(depth - 1, alpha, beta, true);
        this.undoMove(true);
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break; // Cắt tỉa
      }
      return minEval;
    }
  }

  // Tìm nước đi tốt nhất cho AI
  getBestAIMove(level = 2) {
    const legal = this.getLegalMoves();
    if (legal.length === 0) return null;

    // Cấp 1 (Tân binh): Đi ngẫu nhiên hoặc ăn quân đơn giản
    if (level === 1) {
      const captures = legal.filter(m => m.captured);
      if (captures.length > 0 && Math.random() > 0.4) {
        return captures[Math.floor(Math.random() * captures.length)];
      }
      return legal[Math.floor(Math.random() * legal.length)];
    }

    // Cấp 2 (Chiến binh, depth 2) hoặc Cấp 3 (Đại sư, depth 3)
    const depth = level === 2 ? 2 : 3;
    const isAIWhite = this.turn === 'w';
    let bestMove = null;
    let bestVal = isAIWhite ? -Infinity : Infinity;

    // Shuffle để phong phú nước đi
    legal.sort(() => Math.random() - 0.5);
    legal.sort((a, b) => (b.captured ? 1 : 0) - (a.captured ? 1 : 0));

    for (let move of legal) {
      this.makeMove(move, true);
      const score = this.minimax(depth - 1, -Infinity, Infinity, !isAIWhite);
      this.undoMove(true);

      if (isAIWhite) {
        if (score > bestVal) {
          bestVal = score;
          bestMove = move;
        }
      } else {
        if (score < bestVal) {
          bestVal = score;
          bestMove = move;
        }
      }
    }

    return bestMove || legal[0];
  }
}

window.ChessGame = ChessGame;
