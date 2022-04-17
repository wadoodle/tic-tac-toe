<template>
  <div class="container">
    <h2>WELCOME TO TIC-TAC-TOE</h2>
    <form class="form-style">
      <div class="form-group">
        <label for="name-input">Enter a Nickname</label>
        <input id="name-input" type="text" v-model="enteredName" />
        <button @click.prevent="validateName">Start</button>
        <p v-if="nameError" class="error-message">{{ nameError }}</p>
      </div>
    </form>
  </div>
</template>

<script>
import { state } from "../globalState.js";

export default {
  data() {
    return {
      state,
      nameError: false,
      enteredName: "",
    };
  },
  methods: {
    validateName() {
      //check if a name was entered
      if (this.enteredName != "") {
        this.nameError = false;
        this.setPlayerName();
      } else {
        this.nameError = "Please enter a name.";
      }
    },
    setPlayerName() {
      state.playerName = this.enteredName;
      this.$router.push("/lobby");
    },
  },
};
</script>

<style scoped>
.container {
  width: 800px;
}

.form-style {
  display: flex;
  justify-content: center;
}

.form-style input {
  width: 65%;
}

@media (min-width: 576px) {
  .form-style input {
    width: 300px;
  }
}
</style>