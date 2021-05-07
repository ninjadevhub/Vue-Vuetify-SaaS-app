import Vue from 'vue'
import App from './App.vue'
import vueCustomElement from 'vue-custom-element';
import 'document-register-element/build/document-register-element'
import vuetify from './plugins/vuetify';
import axios from 'axios'
import VueAxios from 'vue-axios';
import VueLayers from 'vuelayers'
import 'vuelayers/lib/style.css';
import 'vuetify/dist/vuetify.min.css';
import VueSignalR from '@latelier/vue-signalr';
import Vue2LeafletMarkerCluster from 'vue2-leaflet-markercluster'
import { LMap, LTileLayer, LMarker, LPopup } from 'vue2-leaflet';
import 'leaflet/dist/leaflet.css';
// eslint-disable-next-line  
delete L.Icon.Default.prototype._getIconUrl  
// eslint-disable-next-line  
L.Icon.Default.mergeOptions({  
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),  
  iconUrl: require('leaflet/dist/images/marker-icon.png'),  
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')  
})

Vue.component('l-map', LMap);
Vue.component('l-tile-layer', LTileLayer);
Vue.component('l-marker', LMarker);
Vue.component('l-popup', LPopup);
Vue.component('v-marker-cluster', Vue2LeafletMarkerCluster)

Vue.use(require('vue-moment'));
Vue.use(vueCustomElement)
Vue.use(VueAxios, axios);
Vue.use(VueLayers)
Vue.use(VueSignalR, process.env.VUE_APP_SIGNALR_HUBS+'/viewing')
App.vuetify = vuetify;
Vue.customElement('memoryshare-stream', App)