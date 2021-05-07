<template>
  <v-app>
    <div v-if="loading" class="stream-buffer">
        <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
        <p class="mt-4 text-primary">Setting up player...</p>
    </div>

    <div v-if="preview" class="testing-panel">
      <h5>This is a preview</h5>
      <p>To be used for testing only</p>
    </div>

    <div v-show="!loading" v-if="!optionsJson.playerOnly" class="dash-container video-view" :style="{ background: backgroundImage }">
      <div class="ml-6">
        <img :src="require(`@/assets/images/icon_dark.png`)" alt="logo" class="logo">
        <img :src="require(`@/assets/images/logo_text.png`)" alt="logo" class="logo-text">
      </div>

      <video-player 
        :srcArr="videoArr" 
        :events="events" 
        :ready="eventsLoaded" 
        ref="video" 
        :skipLivePreview="skipLivePreview"
        :role="token" 
        :slug="src"
        :playerOptions="optionsJson" 
        @updateId="updateEventId" />

      <!-- <div v-if="service.serviceState > 1" class="tab-section">
          <v-tabs fixed-tabs v-model="pageTab" color="#0c3c60">
              <v-tab href="#comments">Comments</v-tab>
              <v-tab @click="handleMap()" href="#viewers">Viewers</v-tab>
          </v-tabs>

          <v-tabs-items :value="pageTab">
              <v-tab-item value="comments">
                <VideoComments ref="commentsRef" :slug="src" :role="token" />
              </v-tab-item>

              <v-tab-item value="viewers">
                  <Map ref="mapRef" :slug="src" />
              </v-tab-item>
          </v-tabs-items>
      </div> -->
    </div>

    <div v-else v-show="!loading">
      <video-player 
        :srcArr="videoArr" 
        :events="events" 
        :ready="eventsLoaded" 
        :role="token" 
        :slug="src"
        :skipLivePreview="skipLivePreview"
        :hide-menu="optionsJson.playerOnly" 
        ref="video" 
        @updateId="updateEventId" 
        :playerOptions="optionsJson" />
    </div>
  </v-app>
</template>

<script>
import VideoPlayer from './components/VideoPlayer';
import VideoComments from './components/VideoComments';
import Map from './components/Map';
import { ClockIcon, PlayIcon } from 'vue-feather-icons';

export default {
  props: {
    src: {
      type: String
    },
    token: {
      type: String,
      required: false
    },
    playerOnly: {
      type: Boolean,
    },
    options: {
      type: String,
      required: false
    }
  },
  data() {
		return {
      loading: true,
      pageTab: null,
      events: [],
      videoArr: [],
      eventsLoaded: false,
      optionsJson: {},
      service: {},
      init: true,
      comments: [],
      skipLivePreview: true,
      preview: false,
      backgroundImage: `url(${require('@/assets/images/white-waves.png')})`,
		};
  },
  created() {
    this.optionsJson = JSON.parse(this.options);
    this.$socket.start({
      log: true // Active only in development for debugging.
    });
    this.$socket.invoke('JoinSlug', this.src)
  },
  sockets: {
    NotifyLive(data) {
      this.getServiceBySlug(true, data.streamStatus)
    },
    NotifyEvent(data) {
      console.log('signalR')
      conosle.log(data)
      let item = this.events.find(x => x.id == data.id)
      console.log('item')
      console.log(item)
      item = data;
      this.$refs.video.setServiceState();
    }
    // UNCOMMENT FOR COMMENTS
    // ReceiveMessage(data) {
    //   this.getComments(); 
    // }
  },
  mounted() {
    this.getServiceBySlug()
    // UNCOMMENT FOR COMMENTS
    //this.getComments();
  },
  methods: {
    getServiceBySlug(updateService = false, streamState = 3) {
      console.log('GETTING SERVICE BY SLUG')
        this.axios
            .get(`https://api.memoryshare.com/api/services/view/${ this.src }`)
            .then(response => {
                this.service = response.data;
                this.skipLivePreview = response.data.skipLivePreview;
                this.$refs.video.service = response.data;
                this.preview = response.data.test;

                if (updateService && (streamState === 1 || streamState === 2)) {
                    this.$refs.video.setServiceState();
                } else {
                  response.data.events.forEach((item, i) => {
                      item.active = false;
                      item.index = i;

                      // HIDE TRIBUTE
                      if (item.eventType !== 0) this.events.push(item)  
                  })

                  this.createVideoArr();
                }
            })
            .catch(error => {
              console.log(error)
              console.log(error.response)
            })
       
      },
      createVideoArr() {
        console.log(this.events)
          this.events.filter(item => { 
              if (item.convertedVideo && item.eventType !== 0) this.videoArr.push(item);
          })

          if (this.init) {
            this.$refs.video.initVideoJs();
          } else {
            this.$refs.video.setServiceState();
          }
          this.init = false;
          this.loading = false;
      },
    updateEventId(id) {
      this.$refs.commentsRef.eventId = id;
    },
    getComments() {
      setTimeout(() => {
        if (this.$refs.commentsRef) {
        this.$refs.commentsRef.gettingComments = true;
        this.$refs.commentsRef.comments = []
      } 
      // if (this.$refs.mapRef) this.$refs.map.gettingComments = true;

      this.axios
          .post(`https://api.memoryshare.com/api/comments/getall/${ this.src }`)
          .then(response => {
              this.comments = response.data;
              if (response.data.length) {
              // if super admin show all comments
              if (this.token) {
                if (this.$refs.commentsRef) this.$refs.commentsRef.comments = response.data;
                if (this.$refs.mapRef) this.$refs.mapRef.commentPins = response.data;
                return;
              }

              // else only show the 'clean' comments
              response.data.forEach(item => {
                  if (item.status === 2) {
                    if (this.$refs.commentsRef) this.$refs.commentsRef.comments.push(item)
                    if (this.$refs.mapRef) this.$refs.mapRef.comments.push(item)
                  }
                })
              }
          })
          .catch(error => {
              console.log(error)
          })
          .then(() => {
             if (this.$refs.commentsRef) this.$refs.commentsRef.gettingComments = false;
          })
      }, 1000)
    },
    handleMap() {
      setTimeout(() => {
          this.getComments()
          this.$refs.mapRef.commentPins = this.comments;
          this.$refs.mapRef.init();
        })
    }
  },
  components: {
    VideoPlayer,
    VideoComments,
    Map
  }
}
</script>

<style lang="scss">
    h4 {
      font-size: 1.5rem;
      font-weight: 400;
    }

    h6 {
      font-size: 1.1rem;
      font-weight: 400;
    }

    .leaflet-container .leaflet-marker-pane img {
        border-radius: 50% !important;
        object-fit: cover !important;
    }

    .w-25 {
      width: 25%;
    }

    .w-50 {
      width: 50%;
    }

    .w-75 {
      width: 75%;
    }

    .m-auto {
      margin: auto;
    }

    .error--text .v-messages__message {
      color: #ff5252;
    }

    .text-center {
      text-align: center;
    }

    .video-view {
        margin: 0 !important;
        padding: 2rem 0 !important;
    }

    .stream-buffer {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        z-index: 10001;
    }

    .logo {
        width: 2.5rem;
    }

    .logo-text {
        margin-left: 1rem;
        width: 10rem;
    }

    .tab-section {
        padding: 1rem 0;
        background: #fff;
    }

    .testing-panel {
      position: fixed;
      bottom: 7rem;
      right: 5rem;
      opacity: .7;
      z-index: 1001;
      border: 1px solid #fff;
      padding: 2rem 3rem;
      border-radius: 5px;
      box-shadow: 0 0 5px #333;

      h5 {
        font-size: 2.5rem;
        color: #fff;
        text-shadow: 2px 2px #333;
      }

      p {
        color: #fff;
        text-shadow: 2px 2px #333;
      }
    }

    #details {
        margin: 0;

        ul {
            list-style: none;
            padding: 0;
        }

        li {
            cursor: pointer;
            font-size: 1.2rem;
            padding: .5rem 1rem;
            margin: .75rem 0;
            transition: .3s ease-in-out;

            &.active {
                background: #f4f4f4;
                border-radius: 5px;
            }

            &:hover {
                background: #fafafa;

                .upcoming {
                    opacity: 1;
                }

                .play {
                    fill: #ab0658;
                }
            }
        }
    }

    #viewers {
        padding: 4rem;
    }

    
</style>