<template>
  <section id="chat-wrap">
    <div id="chat-log">
      <template v-for="entry in chatLog" :key="entry">
        <p class="sender">
          <strong>{{ entry.Sender }}</strong>
        </p>
        <p class="message">
          {{ entry.Message }}
        </p>
      </template>
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
        //prevents this from triggering when leaving a game
        if (chatWindow) {
          chatWindow.scrollTop = chatWindow.scrollHeight;
        }
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
#chat-wrap {
  width: 600px;
  max-width: 90%;
  margin: 0 auto;
}

#chat-log {
  height: 120px;
  overflow-y: scroll;
}

::-webkit-scrollbar {
    width: 0;
}

#chat-wrap p {
  padding: 1px 0;
  font-size: 12px;
}

#chat-wrap .sender {
  color: #46cbb3;
  margin-top: 5px;
}

#new-message-con {
  display: flex;
  margin-top: 5px;
}

#new-message-con input {
  flex-grow: 1;
}
</style>