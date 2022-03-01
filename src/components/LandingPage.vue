<template>
  <h1>Tic Tac Toe</h1>
  <div>
    <label id="name-input">Player Name: </label>
    <input id="name-input" type="text" v-model="playerName" />
    <p v-if="nameError" class="error-message">{{ nameError }}</p>
  </div>
  <div style="margin-top: 50px">
    <button @click="newGame">Create New Game</button>
    <p v-if="createError" class="error-message">{{ createError }}</p>
  </div>

  <div style="margin-top: 50px">
    <label id="game-id-input">Game ID: </label>
    <input id="game-id-input" type="text" v-model="gameID" /><br />
    <button @click="checkFull">Join Game</button>
    <p v-if="joinError" class="error-message">{{ joinError }}</p>
  </div>

  <div v-if="joinableGames" style="margin-top: 50px">
    <template v-for="game in joinableGames" :key="game.gameID">
      <div v-if="game.full == false">
        <p>{{ game.player1 }}'s Lobby</p>
        <button @click="setLobbyID(game.gameID)">Join Game</button>
      </div>
    </template>
  </div>
</template>

<script>
import {
  getDatabase,
  get,
  child,
  ref,
  update,
  set,
  onValue,
} from "firebase/database";

export default {
  data() {
    return {
      joinableGames: null,
      playerName: "",
      gameID: "",
      nameError: null,
      createError: null,
      joinError: null,
    };
  },
  created() {
    this.getJoinableGames();
  },
  methods: {
    getJoinableGames() {
      const db = getDatabase();
      const games = ref(db, "games");
      onValue(games, (snapshot) => {
        const data = snapshot.val();
        this.joinableGames = data;
      });
    },
    newGame() {
      let name = this.validateName();
      if(!name) {
        return false;
      }

      const db = getDatabase();
      const gameID = this.generateID(25);
      set(ref(db, "games/" + gameID), {
        gameID: gameID,
        full: false,
        player1: this.playerName,
        currentTurn: "player1",
        boardState: ["", "", "", "", "", "", "", "", ""],
        gameState: "In Progress",
        wins: {
          player1: 0,
          player2: 0,
        },
      }).then(() => {
        this.$router.push("/game/" + gameID + "/player1");
      });
    },
    checkFull() {
      if (this.gameID == "") {
        this.joinError = "Please enter a game ID.";
        return false;
      }

      let name = this.validateName();
      if(!name) {
        return false;
      }

      const dbRef = ref(getDatabase());
      get(child(dbRef, "games/" + this.gameID + "/full"))
        .then((snapshot) => {
          const full = snapshot.val();

          if (full == null) {
            this.joinError = "Please enter a valid game ID";
          } else if (full != true) {
            this.joinGameByID();
          } else {
            this.joinError = "Game is full.";
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
    setLobbyID(gameID) {
      let name = this.validateName();
      if(!name) {
        return false;
      }

      this.gameID = gameID;
      this.joinGameByID();
    },
    joinGameByID() {
      const db = getDatabase();
      const updates = {};
      updates["games/" + this.gameID + "/player2"] = this.playerName;
      updates["games/" + this.gameID + "/full"] = true;
      update(ref(db), updates)
        .then(() => {
          this.$router.push("/game/" + this.gameID + "/player2");
        })
        .then((resp) => {
          console.log("resp");
          console.log(resp);
        })
        .catch((error) => {
          console.log("error");
          console.log(error);
        });
    },
    addNewItem() {
      //for refernce
      const db = getDatabase();
      set(ref(db, "games/13579"), {
        username: "Wadoodle",
        email: "wadoodle@test.com",
        profile_picture: "imageURL.jpg",
      });
    },
    generateID(length) {
      const characters =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let id = "";
      let i = 0;
      while (i < length) {
        id += characters.charAt(Math.floor(Math.random() * characters.length));
        i++;
      }
      return id;
    },
    validateName() {
      let name = false;
      if (this.playerName != "") {
        name = true;
      } else {
        this.nameError = "Please enter a name.";
      }
      return name;
    },
  },
};
</script>

<style scoped>
</style>