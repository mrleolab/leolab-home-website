// SPDX-License-Identifier: GPL-3.0-or-later
const copy = {
  home:['Back to Leo Lab','返回 Leo Lab'], gameName:['/ Chess','/ 国际象棋'], eyebrow:['THE CHESS ROOM','国际象棋室'], title:['Your next move.','下一步，由你。'],
  intro:['A clear board. A worthy opponent. Take your time.','清晰的棋盘，值得挑战的对手。慢慢思考，走好每一步。'], local:['ON-DEVICE AI','本地 AI'], private:['No account. No server. Just chess.','无需账号，无需服务器，专注对弈。'],
  computer:['Stockfish 19','Stockfish 19'], you:['You','你'], white:['White','白方'], black:['Black','黑方'], controls:['Make it your game','设置你的对局'], level:['Difficulty','难度'],
  casual:['Casual','休闲'], club:['Club','进阶'], advanced:['Advanced','高手'], expert:['Expert','专家'], color:['Play as','选择执子'], newGame:['New game','新对局'],
  apply:['Settings apply to your next game.','设置将在新对局中生效。'], undo:['Undo turn','悔棋'], flip:['Flip board','翻转棋盘'], hint:['Hint','提示'],
  boardHelp:['Tap a piece, then its destination. Dragging works too.','先点棋子，再点目标格，也可以拖动走子。'], tools:['Move list & study tools','棋谱与学习工具'], noMoves:['Your story starts with the first move.','从第一步开始，写下你的棋局。'],
  evaluation:['Last engine evaluation','最近引擎评估'], evalNote:['White’s perspective · from the last search, not continuous analysis.','白方视角 · 来自最近搜索，并非持续分析。'], noEval:['Make a move or ask for a hint.','走一步棋，或请求提示。'], depth:['Search depth','搜索深度'],
  keyboard:['Move by coordinates','输入坐标走子'], keyboardHelp:['Example: e2e4. For promotion: e7e8q.','例如 e2e4；升变示例 e7e8q。'], move:['Move','走子'], export:['Download PGN','下载 PGN'], copyFen:['Copy FEN','复制 FEN'], copied:['Position copied.','局面已复制。'], copyError:['Clipboard unavailable. Your position is shown below.','无法访问剪贴板，局面已显示在下方。'],
  loading:['Preparing Stockfish…','正在准备 Stockfish…'], ready:['Stockfish ready','Stockfish 已就绪'], yourTurn:['Your move','轮到你走棋'], thinking:['Stockfish is thinking…','Stockfish 正在思考…'], hintThinking:['Finding a hint…','正在寻找提示…'], inCheck:['Check — protect your king.','将军！请保护你的王。'],
  won:['Checkmate. You win!','将死，你赢了！'], lost:['Checkmate. Stockfish wins.','将死，Stockfish 获胜。'], stalemate:['Draw by stalemate.','逼和。'], repetition:['Draw by repetition.','重复局面和棋。'], material:['Draw: insufficient material.','子力不足，和棋。'], draw:['The game is drawn.','本局和棋。'],
  engineError:['Stockfish could not start. Check your connection and retry.','Stockfish 无法启动，请检查网络后重试。'], retry:['Retry engine','重试引擎'], invalid:['That move is not legal in this position.','当前局面下不能这样走。'],
  promotion:['Choose your promotion','选择升变棋子'], queen:['Queen','后'], rook:['Rook','车'], bishop:['Bishop','象'], knight:['Knight','马'], cancel:['Cancel','取消'],
  restart:['Start a new game? The current position will be cleared.','开始新对局？当前棋局将被清空。'], hintPrefix:['Try','试试'], source:['Open source & licenses','开源与许可证'],
  sourceNote:['Built with Chessground, chess.js, and Stockfish. Free software, provided without warranty.','基于 Chessground、chess.js 与 Stockfish 构建。自由软件，不提供担保。'],
  fullSource:['Source code & build instructions','源码与构建说明'], license:['GNU GPL v3','GNU GPL v3'],
  playLabel:['Chessboard. Use touch or drag, or use the coordinate move form below.','国际象棋棋盘。可触控、拖动，或使用下方坐标表单走子。'],
  installHelp:['If the engine cannot load, the game will not silently substitute another AI.','如果引擎无法加载，不会悄悄替换成其他 AI。']
};
export function text(key, locale = 'en') { return copy[key]?.[locale === 'zh-CN' ? 1 : 0] || key; }
