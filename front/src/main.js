import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import "babel-polyfill"

Vue.use(ElementUI)

Vue.prototype.axios = axios

new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
