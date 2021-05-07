import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';
import 'vuetify/dist/vuetify.min.css';
import axios from 'axios'
import VueAxios from 'vue-axios'
import { Auth0Plugin } from "./auth";
import SideNav from "./components/layout/SideNav.vue";
import { Datetime } from 'vue-datetime'
import 'vue-datetime/dist/vue-datetime.css'
import 'bootstrap/dist/css/bootstrap.css';
import VueLayers from 'vuelayers'
import 'vuelayers/lib/style.css';
import VueSignalR from '@latelier/vue-signalr';
import Donut from 'vue-css-donut-chart';
import 'vue-css-donut-chart/dist/vcdonut.css';
import { VueMaskDirective } from 'v-mask'
import VuetifyMoney from "vuetify-money";
import VueMeta from 'vue-meta';
import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import VueIntercom from 'vue-intercom';

const domain = process.env.VUE_APP_AUTH0_CONFIG_DOMAIN,
      clientId = process.env.VUE_APP_AUTH0_CONFIG_CLIENTID;

Vue.use(Auth0Plugin, {
  domain,
  clientId,
  onRedirectCallback: appState => {
    router.push(
      appState && appState.targetUrl
        ? appState.targetUrl
        : window.location.pathname
    );
  }
});

Vue.config.productionTip = false
Vue.component('side-nav', SideNav);
Vue.component('datetime', Datetime);
Vue.use(VueMeta)
Vue.use(VueSignalR, process.env.VUE_APP_SIGNALR_HUBS+'/application')
Vue.use(VueAxios, axios);
Vue.use(VueLayers)
Vue.use(require('vue-moment'));
Vue.use(Donut);
Vue.use(VuetifyMoney);
Vue.use(VueSweetalert2);
Vue.use(VueIntercom, { appId: 'your-app-id' });
Vue.directive('mask', VueMaskDirective);

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
