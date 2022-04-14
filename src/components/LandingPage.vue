<template>
  <div class="container">
    <h2>GAME LOBBY</h2>

    <form class="form-style">
      <div class="form-group">
        <label for="name-input">Have a Code?</label>
        <input id="name-input" type="text" v-model="gameCode" />
        <button @click.prevent="validateGame">Join</button>
        <p v-if="nameError" class="error-message">{{ nameError }}</p>
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
export default {
  props: ["playerName"],
  data() {
    return {
      joinableGames: null,
      gameID: "",
      gameCode: "",
    };
  },
  created() {
  },
  methods: {},
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