<template>
  <h1>Tic Tac Toe</h1>
  <div>
    <label id="name-input">Player Name: </label>
    <input id="name-input" type="text" v-model="playerNameNew" /><br />
    <button @click="newGame">Create New Game</button>
    <p v-if="createError" class="error-message">{{ createError }}</p>
  </div>

  <div style="margin-top: 50px">
    <label id="game-id-input">Game ID: </label>
    <input id="game-id-input" type="text" v-model="gameID" /><br />

    <label id="name-input">Player Name: </label>
    <input id="name-input" type="text" v-model="playerNameJoin" /><br />

    <button @click="checkFull">Join Game</button>
    <p v-if="joinError" class="error-message">{{ joinError }}</p>
  </div>

  <p>{{ data }}</p>
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
      data: null,
      playerNameNew: "",
      playerNameJoin: "",
      gameID: "",
      createError: null,
      joinError: null,
    };
  },
  created() {},
  methods: {
    newGame() {
      if (this.playerNameNew == "") {
        this.createError = "Please enter a name.";
        return false;
      }

      const db = getDatabase();
      const gameID = this.generateID(25);
      set(ref(db, "games/" + gameID), {
        full: false,
        player1: this.playerNameNew,
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
      } else if (this.playerNameJoin == "") {
        this.joinError = "Please enter a name.";
        return false;
      }

      const dbRef = ref(getDatabase());
      get(child(dbRef, "games/" + this.gameID + "/full"))
        .then((snapshot) => {
          const full = snapshot.val();

          if (full == null) {
            this.joinError = "Please enter a valid game ID";
          } else if (full != true) {
            this.joinGame();
          } else {
            this.joinError = "Game is full.";
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
    joinGame() {
      const db = getDatabase();
      const updates = {};
      updates["games/" + this.gameID + "/player2"] = this.playerNameJoin;
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
    getItems() {
      //for refernce
      const db = getDatabase();
      const users = ref(db, "users");
      onValue(users, (snapshot) => {
        const data = snapshot.val();
        this.data = data;
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
  },
};
</script>

<style scoped>
</style>