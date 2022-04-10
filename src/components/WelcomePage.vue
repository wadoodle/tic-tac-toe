<template>
  <div class="container">
    <h2>WELCOME TO TIC-TAC-TOE</h2>
    <form class="form-style">
      <div class="form-group">
        <label for="name-input">Enter a Nickname</label>
        <input id="name-input" type="text" v-model="playerName" />
        <p v-if="nameError" class="error-message">{{ nameError }}</p>
        <button @click.prevent="setPlayerName">Start</button>
        </div>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      nameError: null,
      playerName: "",
    };
  },
  methods: {
    setPlayerName() {
      this.$emit("set-name", this.playerName);
      this.playerName = "";
    },
  },
};
</script>

<style scoped>
.container {
  width: 800px;
}

h2 {
  text-align: center;
  color: #46cbb3;
  font-size: 32px;
  padding: 25px;
}

.form-style {
  display: flex;
  justify-content: center;
}
</style>