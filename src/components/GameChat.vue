<template>
  <section id="chat">
    <div id="chat-log">
      <p v-for="entry in chatLog" :key="entry">
        <strong>{{ entry.Sender }}:</strong> {{ entry.Message }}
      </p>
    </div>
    <form id="new-message-con">
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
  watch: {
    //scroll chat window to bottom of div when there is a new message
    //probably a better way to do this without using setTimeout...
    chatLog: function () {
      setTimeout(function () {
        let chatWindow = document.getElementById("chat-log");
        chatWindow.scrollTop = chatWindow.scrollHeight;
      }, 100);
    },
  },
  methods: {
    sendMessage() {
      this.$emit("send-message", this.newMessage);
      this.newMessage = "";
    },
  },
};
</script>

<style scoped>
#chat {
  width: 600px;
  max-width: 90%;
  margin: 0 auto;
}

#chat-log {
  height: 100px;
  overflow-y: scroll;
}

#chat-log p {
  padding: 1px 0;
}

#new-message-con {
  display: flex;
  margin-top: 1rem;
}

#new-message-con input {
  flex-grow: 1;
}
</style>