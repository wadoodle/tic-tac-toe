<template>
  <button id="leave-game" @click="leaveGame">X</button>
  <h1>Game Lobby</h1>
  <p>Game ID: {{ gameID }}</p>
  <button v-if="!game || !game.full" @click="playAgainstTicTacBot">
    Play against TicTac Bot
  </button>

  <template v-if="game">
    <div id="score">
      <div class="top">{{ game.player1 }} X's</div>
      <div class="top right">
        <span v-if="game.player2">{{ game.player2 }} O's</span>
      </div>
      <div class="bottom">{{ game.wins.player1 }}</div>
      <div class="bottom right">{{ game.wins.player2 }}</div>
    </div>

    <h3 class="center-text">{{ currentTurnName }}'s turn</h3>

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

    <template v-if="game.gameState !== 'In Progress'">
      <h2>{{ game.gameState }}</h2>
      <button
        v-if="game.gameState !== 'In Progress'"
        @click="newGame"
        id="new-game-btn">
        New Game
      </button>
    </template>

    <p v-if="error" class="error-message">{{ error }}</p>

    <game-chat :chatLog="game.chatLog" @send-message="sendMessage"></game-chat>
  </template>
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

      let sender;
      if(this.player !== 'player1' && this.player !== 'player2') {
        sender = this.playerName;
      } else {
        sender = this.player;
      }

      let newMessage = {
        Sender: sender,
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

      let winningSpace = this.checkBotWinningOrBlockingMove('winning');
      let blockingSpace = this.checkBotWinningOrBlockingMove('blocking');
      let cornerSpace = this.checkBotCornerMove();
      let centerSpace = this.game.boardState[4] === "" ? true : false;

      if (winningSpace !== undefined) {
        this.game.boardState[winningSpace] = "O";
      } else if (blockingSpace !== undefined) {
        this.game.boardState[blockingSpace] = "O";
      } else if (cornerSpace) {
        this.game.boardState[cornerSpace] = "O";
      } else if(centerSpace) {
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
      if(moveType === 'winning') {
        checkFor = "O";
      } else if(moveType === 'blocking') {
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
        update(ref(db), updates).then(this.$router.push("/"));
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
        update(ref(db), updates).then(this.$router.push("/"));
      }
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
#leave-game {
  display: block;
  margin: 25px 25px 25px auto;
  width: 20px;
  border: none;
  padding: 5px 6px;
}

#leave-game:hover {
  cursor: pointer;
}

#new-game-btn {
  display: block;
  margin: 0 auto;
}

h2 {
  text-align: center;
}

#score {
  margin: 0 auto 50px auto;
  width: 300px;
  display: grid;
  grid-template-columns: 150px 150px;
  grid-template-rows: 50px 50px;
}

#score div {
  display: flex;
  justify-content: center;
  align-items: center;
}

#score .top {
  border-bottom: 2px solid black;
}

#score .right {
  border-left: 2px solid black;
}

#game-board {
  margin: 25px auto;
  width: 300px;
  display: grid;
  grid-template-columns: 100px 100px 100px;
  grid-template-rows: 100px 100px 100px;
}

#game-board div {
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 48px;
  font-weight: bold;
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