import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    menuShowing: false,
    topNavShowing: true,
    UsersTableShowing: false,
    streaming: false,
    videoSrc: '',
  },
  mutations: {
    toggleSideNav(state) {
      state.menuShowing = !state.menuShowing;
    },
    toggleTopNav(state, payload) {
      state.topNavShowing = payload;
    },
    toggleUsersTable(state) {
      state.UsersTableShowing = !state.UsersTableShowing;
    },
    toggleStreaming(state, payload) {
      state.streaming = payload;
    },
    setVideoSrc(state, payload) {
      state.videoSrc = payload
    }
  },
  actions: {
    toggleSideNav(context) {
      context.commit('toggleSideNav')
    },
    toggleTopNav(context, payload) {
      context.commit('toggleTopNav', payload)
    },
    toggleUsersTable(context) {
      context.commit('toggleUsersTable')
    },
    toggleStreaming(context, payload) {
      context.commit('toggleStreaming', payload)
    },
    setVideoSrc(context, payload) {
      context.commit('setVideoSrc', payload)
    }
  },
  modules: {
  }
})
