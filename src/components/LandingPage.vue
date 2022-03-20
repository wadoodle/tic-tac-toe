<template>
  <h1 class="center-text">Tic Tac Toe</h1>
  <form class="form-style">
    <div>
      <label id="name-input">Enter player name </label>
      <input id="name-input" type="text" v-model="playerName" />
      <p v-if="nameError" class="error-message">{{ nameError }}</p>
    </div>

    <create-game :player-name="playerName"></create-game>

    <join-game :player-name="playerName"></join-game>
  </form>
</template>

<script>
export default {
  data() {
    return {
      joinableGames: null,
      playerName: "",
      gameID: "",
      nameError: null,
    };
  },
  provide() {
    return {
      validateName: this.validateName,
    }
  },
  methods: {
    validateName() {
      //check if a name was entered
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