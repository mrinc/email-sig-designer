import { createApp } from "vue";
import { createRouter, createWebHashHistory, createWebHistory } from "vue-router";
import App from "./App.vue";

import Advanced from "./Advanced.vue";
import User from "./User.vue";

import "./assets/main.css";

const router = createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: createWebHistory(),
  routes: [
    { path: "/q", component: User },
    { path: "/", component: Advanced },
  ],
});

const app = createApp(App);
app.use(router);
app.mount("#app");
