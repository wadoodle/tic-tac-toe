<template>
  <section id="top">
    <div id="leave-game" @click="leaveGame">
      <img src="../images/back-icon.png" /><span>Back to lobby</span>
    </div>

    <div id="game-code" :data-code="gameID" @click="copyGameCode">
      <span>Copy game code </span><img src="../images/clipboard-icon.png" />
    </div>
  </section>

  <div v-if="game" class="wrap">
    <div id="board">
      <h2>GAME BOARD</h2>
      <p v-if="error" class="error-message">{{ error }}</p>
      <div id="game-board">
        <div
          v-for="(item, index) in game.boardState"
          :id="'pos' + index"
          :key="'pos' + index"
          @click="makePlayerMove(index)"
        >
          {{ item }}
        </div>
      </div>
    </div>

    <div id="game">
      <h2>GAME</h2>
      <template v-if="!game || !game.full">
        <p>Waiting for a player to join...</p>
        <button @click="playAgainstTicTacBot" class="yellow-button">
          Play TacBot
        </button>
      </template>

      <template v-else-if="game.gameState === 'In Progress'">
        <p class="center-text">{{ currentTurnName }}'s turn</p>
      </template>

      <template v-if="game.gameState !== 'In Progress'">
        <h3>{{ game.gameState }}</h3>
        <button class="yellow-button" @click="newGame">New Game</button>
      </template>
    </div>

    <div id="stats">
      <h2>STATS</h2>
      <div id="score">
        <div class="top">{{ game.player1 }}'s Wins<br />(X)</div>
        <div class="top right">
          <template v-if="game.player2"
            >{{ game.player2 }}'s Wins<br />(O)</template
          >
        </div>
        <div class="bottom">
          <span>{{ game.wins.player1 }}</span>
        </div>
        <div class="bottom right">
          <span>{{ game.wins.player2 }}</span>
        </div>
      </div>
    </div>

    <div id="chat">
      <h2>CHAT</h2>
      <game-chat
        :chatLog="game.chatLog"
        @send-message="sendMessage"
      ></game-chat>
    </div>
  </div>
</template>

<script>
import { getDatabase, ref, onValue, update } from "firebase/database";

export default {
  props: ["gameID", "setPlayer"],
  data() {
    return {
      game: null,
      error: null,
      player: this.setPlayer,
      ticTacBot: false,
      winConditions: [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
      ],
    };
  },
  computed: {
    playerName: function () {
      return this.game[this.setPlayer];
    },
    currentTurnName: function () {
      return this.game[this.game.currentTurn];
    },
  },
  created() {
    this.getGame();
    window.addEventListener("beforeunload", this.leaveGame);
  },
  methods: {
    sendMessage(message) {
      let newMessage = {
        Sender: this.playerName,
        Message: message,
      };

      this.game.chatLog.push(newMessage);

      const db = getDatabase();
      const updates = {};
      updates["games/" + this.gameID + "/chatLog"] = this.game.chatLog;

      update(ref(db), updates).catch((error) => {
        console.log("error");
        console.log(error);
      });
    },
    newGame() {
      //reset game state
      const db = getDatabase();
      const updates = {};

      let newGameStartTurn =
        this.game.currentTurn === "player1" ? "player2" : "player1";

      //make player always first for my testing
      if (this.ticTacBot) {
        newGameStartTurn = "player1";
      }

      updates["games/" + this.gameID + "/currentTurn"] = newGameStartTurn;
      updates["games/" + this.gameID + "/boardState"] = [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ];
      updates["games/" + this.gameID + "/gameState"] = "In Progress";

      update(ref(db), updates);
    },
    makePlayerMove(index) {
      //can only move if the game hasn't ended
      if (this.game.gameState !== "In Progress") {
        this.error = "Game is over.";
        return false;
      }

      const playersHere = this.game.full;
      const myTurn = this.game.currentTurn === this.player;
      const emptySpace = this.game.boardState[index] === "";

      //can only move if other player is present, it's your turn, and an empty space has been selected.
      if (!playersHere) {
        this.error = "Other player must join.";
      } else if (!myTurn) {
        this.error = "Please wait your turn.";
      } else if (!emptySpace) {
        this.error = "Please select an empty space.";
      } else {
        this.error = null;

        //first player gets X's second player gets 0's
        const XO = this.player === "player1" ? "X" : "O";
        this.game.boardState[index] = XO;

        //record move to db
        const db = getDatabase();
        const updates = {};
        updates["games/" + this.gameID + "/boardState"] = this.game.boardState;

        //check if move ends the game
        let gameState = this.checkGameState();

        if (gameState === "In Progress") {
          //if not set currentTurn to next player
          this.game.currentTurn =
            this.game.currentTurn === "player1" ? "player2" : "player1";

          updates["games/" + this.gameID + "/currentTurn"] =
            this.game.currentTurn;
        } else if (gameState === "It's a tie!") {
          //if so update game state
          updates["games/" + this.gameID + "/gameState"] = gameState;
        } else {
          //someone has won
          updates["games/" + this.gameID + "/gameState"] = gameState;
          updates["games/" + this.gameID + "/wins/" + this.game.currentTurn] =
            this.game.wins[this.game.currentTurn] + 1;
        }

        update(ref(db), updates).then(() => {
          if (this.ticTacBot) {
            this.makeBotMove();
          }
        });
      }
    },
    makeBotMove() {
      //can only move if the game hasn't ended
      if (this.game.gameState !== "In Progress") {
        return false;
      }

      let winningSpace = this.checkBotWinningOrBlockingMove("winning");
      let blockingSpace = this.checkBotWinningOrBlockingMove("blocking");
      let cornerSpace = this.checkBotCornerMove();
      let centerSpace = this.game.boardState[4] === "" ? true : false;

      if (winningSpace !== undefined) {
        this.game.boardState[winningSpace] = "O";
      } else if (blockingSpace !== undefined) {
        this.game.boardState[blockingSpace] = "O";
      } else if (cornerSpace) {
        this.game.boardState[cornerSpace] = "O";
      } else if (centerSpace) {
        this.game.boardState[4] = "O";
      } else {
        //makes move in random empty space
        let moveSpace;
        let emptySpaces = [];
        this.game.boardState.forEach((space, index) => {
          if (space === "") {
            emptySpaces.push(index);
          }
        });

        moveSpace = emptySpaces[Math.floor(Math.random() * emptySpaces.length)];
        this.game.boardState[moveSpace] = "O";
      }

      this.handleMove(true);
    },
    checkBotWinningOrBlockingMove(moveType) {
      let checkFor;
      if (moveType === "winning") {
        checkFor = "O";
      } else if (moveType === "blocking") {
        checkFor = "X";
      }

      //is there a winning or blocking move?
      let board = this.game.boardState;
      let moveSpace;
      this.winConditions.forEach((condition) => {
        let moveType = 0;
        let empty = 0;
        let emptySpace;

        condition.forEach((space) => {
          if (board[space] === "") {
            empty += 1;
            emptySpace = space;
          } else if (board[space] === checkFor) {
            moveType += 1;
          }
        });

        if (moveType === 2 && empty === 1) {
          moveSpace = emptySpace;
        }
      });
      return moveSpace;
    },
    checkBotCornerMove() {
      let board = this.game.boardState;
      let moveSpace;
      let corners = [0, 2, 6, 8];
      let emptyCorners = [];
      corners.forEach((space) => {
        if (board[space] === "") {
          emptyCorners.push(space);
        }
      });

      if (emptyCorners.length > 0) {
        moveSpace =
          emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
      }

      return moveSpace;
    },
    handleMove() {
      //check if move ends the game
      let gameState = this.checkGameState();

      //record move to db
      const db = getDatabase();
      const updates = {};

      if (gameState === "In Progress") {
        //if not set currentTurn to next player
        this.game.currentTurn =
          this.game.currentTurn === "player1" ? "player2" : "player1";

        updates["games/" + this.gameID + "/currentTurn"] =
          this.game.currentTurn;
      } else if (gameState === "It's a tie!") {
        //if so update game state
        updates["games/" + this.gameID + "/gameState"] = gameState;
      } else {
        //someone has won
        updates["games/" + this.gameID + "/gameState"] = gameState;
        updates["games/" + this.gameID + "/wins/" + this.game.currentTurn] =
          this.game.wins[this.game.currentTurn] + 1;
      }

      updates["games/" + this.gameID + "/boardState"] = this.game.boardState;
      updates["games/" + this.gameID + "/currentTurn"] = "player1";

      update(ref(db), updates);
    },
    checkGameState() {
      let gameState = "In Progress";
      let board = this.game.boardState;

      //check for win
      this.winConditions.forEach((condition) => {
        if (
          board[condition[0]] !== "" &&
          board[condition[0]] === board[condition[1]] &&
          board[condition[1]] === board[condition[2]]
        ) {
          gameState = `${this.currentTurnName} win's the game!`;
        }
      });

      //check for tie
      if (!board.includes("") && gameState === "In Progress") {
        gameState = "It's a tie!";
      }

      return gameState;
    },
    getGame() {
      //get game data and watch it for updates
      const db = getDatabase();
      const game = ref(db, "games/" + this.gameID);
      onValue(game, (snapshot) => {
        const data = snapshot.val();
        this.game = data;
      });
    },
    leaveGame() {
      const db = getDatabase();
      const updates = {};

      //if only player in lobby, then delete game data
      if (
        (this.player === "player1" && !this.game.full) ||
        this.ticTacBot === true
      ) {
        updates["games/" + this.gameID] = null;
        update(ref(db), updates).then(this.$router.push("/lobby"));
      } else {
        //reset game state
        const remainingPlayer =
          this.player === "player1" ? "player2" : "player1";
        const remainingPlayerName = this.game[remainingPlayer];

        updates["games/" + this.gameID + "/full"] = false;
        updates["games/" + this.gameID + "/player1"] = remainingPlayerName;
        updates["games/" + this.gameID + "/player2"] = null;
        updates["games/" + this.gameID + "/currentTurn"] = "player1";
        updates["games/" + this.gameID + "/boardState"] = [
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ];
        updates["games/" + this.gameID + "/gameState"] = "In Progress";
        updates["games/" + this.gameID + "/wins"] = {
          player1: 0,
          player2: 0,
        };
        update(ref(db), updates).then(this.$router.push("/lobby"));
      }
    },
    copyGameCode() {
      let codeContainer = document.getElementById("game-code");

      //copy the code to clipboard
      let code = codeContainer.getAttribute("data-code");
      navigator.clipboard.writeText(code);

      //show feedback to user
      codeContainer.classList.add('copied');
      setTimeout(function() {
        codeContainer.classList.remove('copied');
      }, 200)
      
    },
    playAgainstTicTacBot() {
      const db = getDatabase();
      const updates = {};
      updates["games/" + this.gameID + "/player2"] = "TicTac Bot";
      updates["games/" + this.gameID + "/full"] = true;

      update(ref(db), updates)
        .then(() => {
          this.ticTacBot = true;
        })
        .catch((error) => {
          console.log("error");
          console.log(error);
        });
    },
  },
  watch: {
    game: function () {
      this.error = null;

      if (this.player === "player2" && !this.game.full) {
        this.player = "player1";
      }
    },
  },
};
</script>

<style scoped>
#top {
  display: flex;
  justify-content: space-between;
  width: 1000px;
  max-width: 90%;
  margin: 15px auto;
}

#leave-game,
#game-code {
  display: flex;
  align-items: center;
  transition: 0.2s;
}

#leave-game img,
#game-code img {
  height: 24px;
  width: 24px;
}

#leave-game span,
#game-code span {
  color: white;
}

#leave-game span {
  font-size: 12px;
  margin-left: 5px;
}

#game-code span {
  font-size: 12px;
  margin-right: 5px;
}

@media (min-width: 576px) {
  #leave-game span {
    font-size: 24px;
    margin-left: 10px;
  }

  #game-code span {
    font-size: 16px;
    margin-right: 10px;
  }
}

#leave-game:hover,
#game-code:hover {
  cursor: pointer;
}

#game-code.copied {
  transform: translateY(-0.5em);
}

#board {
  grid-area: board;
}

#game {
  grid-area: game;
  text-align: center;
}

#stats {
  grid-area: stats;
}

#chat {
  grid-area: chat;
}

#board,
#game,
#stats,
#chat {
  margin: 0 auto;
  width: 100%;
  background: rgba(248, 248, 248, 0.85);
  border-radius: 6px;
  padding-bottom: 15px;
}

.wrap {
  width: 1000px;
  max-width: 90%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: auto;
  grid-template-areas:
    "game"
    "stats"
    "board"
    "chat";
  grid-gap: 20px;
}

@media (min-width: 768px) {
  .wrap {
    grid-template-columns: 2fr 1fr;
    grid-template-areas:
      "board game"
      "board stats"
      "chat chat";
  }
}

@media (min-width: 992px) {
  .wrap {
    grid-template-columns: 2fr 1fr;
    grid-template-areas:
      "board game"
      "board stats"
      "chat .";
  }
}

#new-game-btn {
  display: block;
  margin: 0 auto;
}

h2 {
  text-align: center;
}

#score {
  margin: 0 auto;
  width: 90%;
  text-align: center;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

#score div {
  display: flex;
  justify-content: center;
  align-items: center;
}

#score .bottom {
  font-family: "Risque", cursive;
  color: white;
}

#score span {
  background: #46cbb3;
  width: 60px;
  height: 60px;
  border-radius: 30px;
  line-height: 60px;
  font-size: 48px;
}

#game-board {
  width: 240px;
  height: 240px;
  max-width: 90%;
  font-family: "Risque", cursive;
  margin: 25px auto;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
}

#game-board div {
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 48px;
  font-weight: bold;
}

@media (min-width: 576px) {
  #game-board {
    width: 300px;
    height: 300px;
  }
}

#pos1,
#pos7 {
  border-right: 2px solid black;
  border-left: 2px solid black;
}

#pos3,
#pos5 {
  border-top: 2px solid black;
  border-bottom: 2px solid black;
}

#pos4 {
  border: 2px solid black;
}
</style>