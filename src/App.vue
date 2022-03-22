<template>
  <div class="container">
    <router-view></router-view>
  </div>
</template>


<script>
export default {
  data() {
    return {};
  },
  provide() {
    return {};
  },
  created() {},
  methods: {},
};
</script>


<style>
* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
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

.center-text {
  text-align: center;
}

#game-board {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
}

.error-message {
  color: red;
}

/* FORM STYLES */
.form-style {
  margin: 10px auto;
  max-width: 800px;
  padding: 20px 12px 10px 20px;
  font: 13px "Lucida Sans Unicode", "Lucida Grande", sans-serif;
}

.form-style li {
  padding: 0;
  display: block;
  list-style: none;
  margin: 10px 0 0 0;
}

.form-style label {
  margin: 0 0 3px 0;
  padding: 0px;
  display: block;
  font-weight: bold;
}

#chat input[type="text"],
.form-style input[type="text"],
.form-style input[type="date"],
.form-style input[type="datetime"],
.form-style input[type="number"],
.form-style input[type="search"],
.form-style input[type="time"],
.form-style input[type="url"],
.form-style input[type="email"],
textarea,
select {
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  border: 1px solid #bebebe;
  padding: 7px;
  margin: 0px;
  transition: all 0.3s ease-in-out;
  -webkit-transition: all 0.3s ease-in-out;
  -moz-transition: all 0.3s ease-in-out;
  -ms-transition: all 0.3s ease-in-out;
  -o-transition: all 0.3s ease-in-out;
  outline: none;
}

#chat input[type="text"]:focus,
.form-style input[type="text"]:focus,
.form-style input[type="date"]:focus,
.form-style input[type="datetime"]:focus,
.form-style input[type="number"]:focus,
.form-style input[type="search"]:focus,
.form-style input[type="time"]:focus,
.form-style input[type="url"]:focus,
.form-style input[type="email"]:focus,
.form-style textarea:focus,
.form-style select:focus {
  -moz-box-shadow: 0 0 8px #88d5e9;
  -webkit-box-shadow: 0 0 8px #88d5e9;
  box-shadow: 0 0 8px #88d5e9;
  border: 1px solid #88d5e9;
}

.form-style .field-divided {
  width: 49%;
}

.form-style .field-long {
  width: 100%;
}

.form-style .field-select {
  width: 100%;
}

.form-style .field-textarea {
  height: 100px;
}

button {
  background: #4b99ad;
  padding: 8px 15px 8px 15px;
  border: none;
  color: #fff;
}

button:hover {
  background: #4691a4;
  box-shadow: none;
  -moz-box-shadow: none;
  -webkit-box-shadow: none;
  cursor: pointer;
}

.form-style button {
  margin: 15px 10px 15px auto;
}

.form-style .required {
  color: red;
}
</style>