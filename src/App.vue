<template>
  <h1>TIC-TAC-TOE</h1>
  <router-view></router-view>
</template>


<script>
export default {
  data() {
    return {};
  },
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
  height: 100%;
}

body {
  background-image: linear-gradient(#50a5b8, #46cbb3);
  background-repeat: no-repeat;
  background-attachment: fixed;
  padding-bottom: 20px;
}

body,
p {
  margin: 0;
}

h1 {
  font-family: "Irish Grover", cursive;
  text-align: center;
  font-size: 36px;
  padding: 20px 0;
  background: linear-gradient(180deg, #f8f8f8 0%, #fffcf7 27.6%, #fdebae 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

h2 {
  font-family: "Koulen", cursive;
  font-weight: normal;
  text-align: center;
  color: #46cbb3;
  font-size: 32px;
  padding: 15px;
}

.container {
  margin: 0 auto;
  max-width: 90%;
  background: rgba(248, 248, 248, 0.85);
  border-radius: 6px;
  padding: 20px;
}

.center-text {
  text-align: center;
}

.yellow-button {
  display: block;
  margin: 15px auto;
  background-color: #fccb1e;
  color: black;
  border-radius: 17px;
}

.yellow-button:hover {
  background-color: #efbe11;
}

.error-message {
  color: red;
  text-align: center;
}

/* FORM STYLES */
.form-style {
  margin: 10px auto;
  width: 800px;
  max-width: 95%;
  padding: 25px 10px;
  font: 13px "Lucida Sans Unicode", "Lucida Grande", sans-serif;
}

.form-group {
  width: 100%;
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
  border: none;
  padding: 7px;
  margin: 0px;
  transition: all 0.3s ease-in-out;
  -webkit-transition: all 0.3s ease-in-out;
  -moz-transition: all 0.3s ease-in-out;
  -ms-transition: all 0.3s ease-in-out;
  -o-transition: all 0.3s ease-in-out;
  outline: none;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
  border-top: 2px solid #46cbb3;
  border-bottom: 2px solid #46cbb3;
  border-left: 2px solid #46cbb3;
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
  background: #46cbb3;
  padding: 9px 15px 9px 15px;
  border: none;
  color: #fff;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
}

button:hover {
  background: #2db29a;
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

/*Breakpoints*/
@media (min-width: 576px) {
  h1 {
    font-size: 48px;
  }

  .form-group {
    width: auto;
  }
}

@media (min-width: 768px) {
  h1 {
    font-size: 60px;
  }
}
</style>