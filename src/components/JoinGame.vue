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
        <button @click.prevent="setLobbyID(game.gameID)">
          Join
        </button>
      </div>
    </template>
  </div>
</template>


<script>
import {
  getDatabase,
  ref,
  onValue,
  update,
  get,
  child,
} from "firebase/database";

export default {
  props: ["playerName"],
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
    setLobbyID(gameID) {
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
        .catch((error) => {
          console.log("error");
          alert(error);
        });
    },
    checkGameValidity() {
      //check game id was entered
      if (this.gameID === "") {
        this.joinError = "Please enter a game ID.";
        return false;
      }

      const dbRef = ref(getDatabase());
      get(child(dbRef, "games/" + this.gameID + "/full"))
        .then((snapshot) => {
          const full = snapshot.val();

          //join game if it exists and is not full
          if (full === null) {
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