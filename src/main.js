import Vue from 'vue'
import App from './App.vue'
import { store } from './js/store'

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
