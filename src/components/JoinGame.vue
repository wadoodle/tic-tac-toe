<template>
  <!-- this was for joining a game by manually providing the game ID -->
  <!--div>
    <label id="game-id-input">Game ID: </label>
    <input id="game-id-input" type="text" v-model="gameID" /><br />
    <button @click.prevent="checkGameValidity">Join Game</button>
    <p v-if="joinError" class="error-message">{{ joinError }}</p>
  </div-->

  <h3>Join Game</h3>

  <div v-if="joinableGames" class="games-list">
    <template v-for="game in joinableGames" :key="game.gameID">
      <div v-if="game.full === false" class="game">
        <p>{{ game.player1 }}'s Lobby</p>
        <button @click.prevent="joinGame(game.gameID)">Join</button>
      </div>
    </template>
  </div>
</template>


<script>
import {
  getDatabase,
  ref,
  onValue,
} from "firebase/database";

export default {
  props: ["playerName"],
  emits: ["join-game"],
  data() {
    return {
      joinableGames: null,
      joinError: null,
    };
  },
  created() {
    this.getJoinableGames();
  },
  methods: {
    getJoinableGames() {
      //get all existing games that aren't full
      const db = getDatabase();
      const games = ref(db, "games");
      onValue(games, (snapshot) => {
        const data = snapshot.val();
        this.joinableGames = data;
      });
    },
    joinGame(gameID) {
      this.$emit("join-game", gameID);
    },
  },
};
</script>

<style scoped>
h3 {
  text-align: center;
}

.games-list {
  width: 350px;
  max-width: 90%;
  margin: 0 auto;
}

.game {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  width: 100%;
}

button {
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
}
</style>