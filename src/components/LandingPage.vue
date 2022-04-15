<template>
  <div class="container">
    <h2>GAME LOBBY</h2>

    <form class="form-style">
      <div class="form-group">
        <label for="name-input">Have a Code?</label>
        <input id="name-input" type="text" v-model="gameID" />
        <button @click.prevent="validateGame">Join</button>
        <p v-if="joinError" class="error-message">{{ joinError }}</p>
      </div>
    </form>

    <div class="layout">
      <div class="layout-item">
        <join-game :player-name="playerName"></join-game>
      </div>
      <div class="layout-item">
        <create-game :player-name="playerName"></create-game>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getDatabase,
  ref,
  get,
  child,
  update,
} from "firebase/database";

export default {
  props: ["playerName"],
  data() {
    return {
      joinableGames: null,
      gameID: "",
      joinError: null,
    };
  },
  created() {
  },
  methods: {
    validateGame() {
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
            this.gameID = "";
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
    joinGameByID() {
      const db = getDatabase();
      const updates = {};
      updates["games/" + this.gameID + "/player2"] = this.playerName;
      updates["games/" + this.gameID + "/full"] = true;

      console.log(updates);

      update(ref(db), updates)
        .then(() => {
          this.$router.push("/game/" + this.gameID + "/player2");
        })
        .catch((error) => {
          console.log("error");
          alert(error);
        });
    },
  },
};
</script>

<style scoped>
.container {
  width: 1200px;
}

.form-style {
  text-align: center;
}

.form-style input {
  width: 65%;
}

@media (min-width: 576px) {
  .form-style input {
    width: 300px;
  }
}

.layout {
  display: flex;
  flex-wrap: wrap;
}

.layout-item {
  flex: 100%;
  width: 100%;
}

@media (min-width: 768px) {
  .layout-item {
    flex: 50%;
  }
}
</style>