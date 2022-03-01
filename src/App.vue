<template>
  <div class="container">
    <router-view></router-view>
  </div>
</template>


<script>
export default {
  data() {
    return {
      
    };
  },
  provide() {
    return {
      
    }
  },
  created() {
    
  },
  methods: {
  },
};
</script>


<style>
* {
  box-sizing: border-box;
}

html {
  font-family: "Jost", sans-serif;
}

body,
p {
  margin: 0;
}

.container {
  width: 1200px;
  margin: 0 auto;
  max-width: 90%;
}

#game-board {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
}

.error-message {
  color: red;
}
</style>