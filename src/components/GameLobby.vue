<template>
  <button id="leave-game" @click="leaveGame">X</button>
  <h1>Game Lobby</h1>
  <p>Game ID: {{ gameID }}</p>

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
        @click="makeMove(index)"
      >
        {{ item }}
      </div>
    </div>

    <template v-if="game.gameState !== 'In Progress'">
      <h2>{{ game.gameState }}</h2>
      <button
        v-if="game.gameState !== 'In Progress'"
        @click="newGame"
        id="new-game-btn"
      >
        New Game
      </button>
    </template>
  </template>

  <p v-if="error" class="error-message">{{ error }}</p>
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
    };
  },
  computed: {
    currentTurnName: function () {
      return this.game[this.game.currentTurn];
    },
  },
  created() {
    this.getGame();
    window.addEventListener("beforeunload", this.leaveGame);
  },
  methods: {
    newGame() {
      //reset game state
      const db = getDatabase();
      const updates = {};

      let newGameStartTurn =
        this.game.currentTurn === "player1" ? "player2" : "player1";

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
    makeMove(index) {
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

        update(ref(db), updates);
      }
    },
    checkGameState() {
      let gameState = "In Progress";
      let board = this.game.boardState;

      const winConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
      ];

      //check for win
      winConditions.forEach((condition) => {
        if (
          board[condition[0]] !== "" &&
          board[condition[0]] === board[condition[1]] &&
          board[condition[1]] === board[condition[2]]
        ) {
          gameState = `${this.currentTurnName} win's the game!`;
        }
      });

      //check for tie
      if (!board.includes("") && gameState != "won") {
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
      })
    },
    leaveGame() {
      const db = getDatabase();
      const updates = {};

      //if only player in lobby, then delete game data
      if (this.player === "player1" && !this.game.full) {
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