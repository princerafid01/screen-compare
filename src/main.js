import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import GAuth from 'vue-google-oauth2'
import VueRouter from 'vue-router'
import 'nprogress/nprogress.css'


import Signin from './components/Signin'
import Home from './components/Home'

Vue.config.productionTip = false

const gauthOption = {
  clientId: process.env.VUE_APP_GOOGLE_CLIENT_ID,
  scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets',
  prompt: 'consent',
  fetch_basic_profile: false
}

Vue.use(GAuth, gauthOption)
Vue.use(VueRouter)


const routes = [
  { path: '/', component: Signin },
  {
    path: '/home',
    component: Home,
    name: 'home',
    props: true
  }
]


const router = new VueRouter({
  mode: 'history',
  routes // short for `routes: routes`
})

new Vue({
  vuetify,
  router,
  render: h => h(App),
}).$mount('#app')
