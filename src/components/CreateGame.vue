<template>
    <h3>New Game</h3>
    <button @click.prevent="newGame" class="yellow-button">Create New Game</button>
    <p v-if="createError" class="error-message">{{ createError }}</p>
</template>


<script>
import {
  getDatabase,
  set,
  ref,
} from "firebase/database";

export default {
  props: ['playerName'],
  data() {
    return {
      createError: null,
    };
  },
  created() {},
  methods: {
    newGame() {
      //create new game data then navigate to game page
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
        chatLog: [
          {
            Sender: 'System',
            Message: 'Welcome to the Game!',
          }
        ],
      })
      .then(() => {
        this.$router.push("/game/" + gameID + "/player1");
      })
      .catch((error) => {
        this.createError = error;
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
h3 {
  text-align: center;
}
</style>