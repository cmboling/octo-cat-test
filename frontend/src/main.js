import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'

import Axios from 'axios'

import App from './App.vue'
import Login from './components/Login.vue'
import Logout from './components/Logout.vue'
import NotFound from './components/NotFound.vue'
import Gallery from './components/Gallery.vue'
import AuthorizationCallback from './components/AuthorizationCallback.vue'

Vue.config.productionTip = false

Vue.use(Vuex)
Vue.use(VueRouter)

Vue.prototype.$http = Axios

const jwt = {
  decode(token) {
    if (!token) return {}
    const claimset = token.split('.', 3)[1]
    return JSON.parse(atob(claimset))
  },
  isExpired(token){
    const claimset = this.decode(token)
    console.log("Claimset:", claimset)
    const exp = claimset['exp']
    if (exp === undefined) {
      return false
    }
    console.log("Token expiration time since epoch:", exp)
    const nowLocal = new Date()
    const nowLocalInSecondsSincEpoch = Math.floor(nowLocal.getTime()/1000)
    console.log("Local time since epoch:", nowLocal.getTime())
    const nowUTCInSecondsSincEpoch = nowLocalInSecondsSincEpoch + nowLocal.getTimezoneOffset() * 60
    console.log("UTC time since epoch:", nowUTCInSecondsSincEpoch)
    console.log("Expiration delta: ", nowUTCInSecondsSincEpoch - exp)
    return exp <= nowUTCInSecondsSincEpoch
  }
}

const store = new Vuex.Store({
  state: {
    token: localStorage.getItem("token") || '',
    authState: JSON.parse(localStorage.getItem("authState")) || {},
  },
  mutations: {
    login(state, token) {
      state.token = token
    },
    logout(state) {
      state.token = null
      state.profile = {}
    },
    authState(state, s) {
      state.authState = s
    },
  },
  actions: {
    login({ commit }, token) {
      return new Promise((resolve) => {
        console.log("Loggedin with token", token)
        commit('login', token )
        localStorage.setItem('token', token)
        resolve()
      })
    },
    logout({ commit }) {
      return new Promise((resolve) => {
        console.log("Logout")
        commit('logout')
        localStorage.removeItem('token')
        localStorage.removeItem('authState')
        resolve()
      })
    },
    setAuthState({ commit }, state) {
      return new Promise((resolve) => {
        console.log('Setting auth state to: ', state)
        commit('authState', state)
        localStorage.setItem('authState', JSON.stringify(state))
        resolve()
      })
    }
  },
  getters: {
    isLoggedIn: state => !!state.token,
    profile: state => jwt.decode(state.token)['profile'],
    token: state => state.token,
    state: state => state.authState['state'],
    returnUrl: state => state.authState['returnUrl']
  }
})

const router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '/', redirect: '/gallery'},
    { path: '/login', name: 'Login', component: Login },
    { path: '/login/callback', name: "AuthorizationCallback", component: AuthorizationCallback },
    { path: '/logout', name: 'Logout', component: Logout},
    { path: '/gallery', name: 'Gallery', component: Gallery, meta: { requiresAuth: true } },
    { path: '*', component: NotFound }
  ]
})

router.beforeEach((to, from, next) => {
  console.log('beforeEach', to, from)
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (store.getters.isLoggedIn && !jwt.isExpired(store.getters.token)) {
      next()
      return
    }
    next({ path: '/login', query: { returnUrl: to.path } })
  }
  else {
    next()
  }
})

new Vue({
  render: h => h(App),
  store,
  router,
  jwt
}).$mount('#app')
