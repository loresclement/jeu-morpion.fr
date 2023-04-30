const MINIMAX_INFINITY = 100000;

function minimax(board, player)
{
  const result = checkWin(board);

  if (result === 1) 
    return -1;
  else if (result === 2) 
    return 1;
  else if (result === 0)
    return 0;

  let bestScore = player === 2 ? -Infinity : Infinity;
  let bestMove = -1;

  for (let i = 0; i < 9; i++)
  {
    if (board[i] === 0) 
    {
      board[i] = player;
      let score = minimax(board, player === 2 ? 1 : 2);
      board[i] = 0;

      if ((player === 2 && score > bestScore) || (player === 1 && score < bestScore)) 
      {
        bestScore = score;
        bestMove = i;
      }
    }
  }

  if (bestMove === -1) 
    return 0;

  return bestScore;
}

function checkWin(board) 
{
  // Vérifie les lignes
  for (let i = 0; i <= 6; i += 3)
  {
    if (board[i] !== 0 && board[i] === board[i + 1] && board[i + 1] === board[i + 2]) 
      return board[i];
  }

  // Vérifie les colonnes
  for (let i = 0; i < 3; i++) 
  {
    if (board[i] !== 0 && board[i] === board[i + 3] && board[i + 3] === board[i + 6]) 
      return board[i];
  }

  // Vérifie les diagonales
  if (board[0] !== 0 && board[0] === board[4] && board[4] === board[8]) 
    return board[0];

  if (board[2] !== 0 && board[2] === board[4] && board[4] === board[6])
    return board[2];

  // Aucun joueur n'a gagné
  if (board.includes(0)) 
    return -1;
  
  return 0;
}

const findBestMove = board => 
{
  let bestScore = -MINIMAX_INFINITY;
  let bestMove = -1;

  for (let i = 0; i < 9; i++) 
  {
    if (board[i] === 0) 
    {
      board[i] = 2;
      const currentScore = minimax(board, 1);
      board[i] = 0;

      if (currentScore > bestScore)
      {
        bestScore = currentScore;
        bestMove = i;
      }
    }
  }
  return bestMove;
}  


module.exports = { 
    checkWin, minimax, findBestMove 
}
