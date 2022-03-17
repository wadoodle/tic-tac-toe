<template>
  <div>
    <button @click.prevent="newGame">Create New Game</button>
    <p v-if="createError" class="error-message">{{ createError }}</p>
  </div>
</template>


<script>
import {
  getDatabase,
  set,
  ref,
} from "firebase/database";

export default {
  props: ['playerName'],
  inject: ['validateName'],
  data() {
    return {
      createError: null,
    };
  },
  created() {},
  methods: {
    newGame() {
      let name = this.validateName();
      if (!name) {
        return false;
      }

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
      })
      .then(() => {
        this.$router.push("/game/" + gameID + "/player1");
      })
      .catch((error) => {
        this.createError = error;
        console.log(error);
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