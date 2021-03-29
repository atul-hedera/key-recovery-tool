import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false
import 'material-design-icons-iconfont/dist/material-design-icons.css'

new Vue({
  vuetify,
  render: function (h) { return h(App) }
}).$mount('#app')
