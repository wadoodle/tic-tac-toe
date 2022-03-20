<template>
  <section id="chat">
    <p v-for="entry in chatLog" :key="entry">
      <strong>{{ entry.Sender }}:</strong> {{ entry.Message }}
    </p>
    <form class="form-style">
      <input type="text" v-model="newMessage" />
      <button @click.prevent="sendMessage">Send</button>
    </form>
  </section>
</template>

<script>
export default {
  props: ["chatLog"],
  emits: ["send-message"],
  data() {
    return {
      newMessage: "",
    };
  },
  created() {},
  methods: {
    sendMessage() {
      this.$emit("send-message", this.newMessage);
      this.newMessage = "";
    },
  },
};
</script>

<style scoped>
#chat p {
  margin: 10px auto;
  max-width: 800px;
  padding: 0 20px;
}

.form-style input[type="text"] {
  width: 80%;
}
</style>