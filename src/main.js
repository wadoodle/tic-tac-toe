import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';

import App from './App.vue';
import LandingPage from './components/LandingPage.vue';
import CreateGame from './components/CreateGame.vue';
import JoinGame from './components/JoinGame.vue';
import GameLobby from './components/GameLobby.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: LandingPage },
    { path: '/game/:gameID/:setPlayer', component: GameLobby, props: true },
  ]
})

/*firebase stuff start*/
import firebase from 'firebase/compat/app'; //v9
import 'firebase/compat/database'; //v9

const firebaseConfig = {
  apiKey: "AIzaSyDA9FhiPIQYr1IR_wIyXSISZfn_Wsb3gJ0",
  authDomain: "codenames-98c02.firebaseapp.com",
  databaseURL: "https://codenames-98c02-default-rtdb.firebaseio.com",
  projectId: "codenames-98c02",
  storageBucket: "codenames-98c02.appspot.com",
  messagingSenderId: "202410102642",
  appId: "1:202410102642:web:7f114b0cea758656e757eb"
};

firebase.initializeApp(firebaseConfig);

/*firebase stuff end*/

const app = createApp(App);
app.use(router);

app.component('landing-page', LandingPage);
app.component('create-game', CreateGame);
app.component('join-game', JoinGame);
app.component('game-lobby', GameLobby);

app.mount('#app');
