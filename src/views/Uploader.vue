<template>
    <div>
        <side-nav></side-nav>
        <div v-bind:class="[{ 'menu-showing': this.$store.state.menuShowing }, 'dash-container', 'uploader']">
            <h4 class="mt-2 mb-4">Video Uploader</h4>
            <div class="tile elevation-6">
                  <v-stepper v-model="e1">
                        <v-stepper-header>
                        <v-stepper-step @click="e1 = 1" :complete="e1 > 1" step="1">
                            Upload Videos
                        </v-stepper-step>

                        <v-divider></v-divider>

                        <v-stepper-step :complete="e1 > 2" step="2">
                            Set Video Order
                        </v-stepper-step>

                        <v-divider></v-divider>

                        <v-stepper-step :complete="e1 > 3" step="3">
                            Select Start Time
                        </v-stepper-step>

                        <v-divider></v-divider>

                        <v-stepper-step :complete="e1 > 4" step="4">
                            Select End Time
                        </v-stepper-step>

                        <v-divider></v-divider>

                        <v-stepper-step step="5">
                            Upload
                        </v-stepper-step>
                    </v-stepper-header>
                </v-stepper>

                <v-stepper-items v-if="ready">
                    <div v-show="e1 === 1" class="mt-4 mb-4" step="1">
                        <dashboard :uppy="uppy" />
                    </div>

                    <div v-if="e1 === 2" class="mt-4 mb-4" step="2">   
                        <!-- set video order -->
                        <div class="mt-8 ml-6">
                            <h4>Set video order</h4>
                            <span>Set the order of the videos before moving on and editing the timestamps. To change the order simplly drag and drops the videos</span>
                        </div>

                        <draggable v-model="videos" class="video-drag">
                            <transition-group>
                                <div v-for="video in videos" :key="video.id" class="drag-item">
                                        <video controls>
                                            <source :src="video.src" type="video/mp4">
                                        </video>
                                        <div class="mt-2">
                                        <h5>{{ video.name }}</h5>
                                    </div>
                                </div>
                            </transition-group>
                        </draggable>
                        <v-row>
                            <v-col>
                                <v-btn @click="e1 = 1"><chevrons-left-icon size="1.5x" class="mr-2" />Back To Uploads</v-btn>
                            </v-col>
                            <v-col class="text-right">
                                <v-btn @click="goToTimestamps" color="primary">Set Start Time <chevron-right-icon size="1.5x" class="ml-2" /></v-btn>
                            </v-col>
                        </v-row>
                    </div>

                    <div v-if="e1 === 3" class="mt-4 mb-4" step="3"> 
                        <div class="video-editor">
                            <v-row>
                                <v-col>
                                    <video ref="startTimeVideoPlayer" class="edit-video" @timeupdate="setStartTimestamp()" controls>
                                        <source :src="videos[0].src" type="video/mp4">
                                    </video>
                                </v-col>

                                 <v-col class="mt-8 ml-6">
                                    <h5>Select Video Start Time</h5>
                                    <h6 class="mb-4">{{ videos[0].name }}</h6>
                                    <div style="width: 55%; overflow: hidden">
                                        <v-row style="background: #f2f2f2; width: 100%; padding: 0 1rem">
                                            <v-col>
                                                <v-text-field
                                                    readonly 
                                                    v-model="startTime.hours" 
                                                    label="Hours" />
                                            </v-col>
                                            <v-col>
                                                <v-text-field
                                                    readonly 
                                                    v-model="startTime.minutes" 
                                                    label="Minutes" />
                                            </v-col>
                                            <v-col>
                                                <v-text-field 
                                                    readonly
                                                    v-model="startTime.seconds" 
                                                    label="Seconds" />
                                            </v-col>
                                        </v-row>

                                        <div class="video-controls mt-4">
                                            <v-btn @click="$refs.startTimeVideoPlayer.currentTime = 0"><chevrons-left-icon /></v-btn>
                                            <v-btn @click="$refs.startTimeVideoPlayer.currentTime = ($refs.startTimeVideoPlayer.currentTime - 1)"><chevron-left-icon /></v-btn>
                                            <v-btn @click="$refs.startTimeVideoPlayer.currentTime = ($refs.startTimeVideoPlayer.currentTime + 1)"><chevron-right-icon /></v-btn>
                                            <v-btn @click="$refs.startTimeVideoPlayer.currentTime = $refs.startTimeVideoPlayer.duration"><chevrons-right-icon /></v-btn>
                                        </div>

                                        <v-btn @click="setStartTimestamp(true)" block class="mt-4" color="success">Set Start</v-btn>
                                    </div>
                                </v-col>
                            </v-row>
                        </div>
                        <v-row>
                            <v-col>
                                <v-btn @click="e1 = 1"><chevron-left-icon size="1.5x" style="margin-right: -.7rem" /><chevron-left-icon size="1.5x" class="mr-2" />Back To Uploads</v-btn>
                                <v-btn @click="e1 = 2" class="ml-2"><chevron-left-icon size="1.5x" class="mr-2" />ReOrder videos</v-btn>
                            </v-col>
                            <v-col class="text-right">
                                <v-btn @click="setStartTimestamp(true)" color="primary">Save <chevron-right-icon size="1.5x" class="ml-2" /></v-btn>
                            </v-col>
                        </v-row>
                    </div>

                    
                    <div v-if="e1 === 4" class="mt-4 mb-4" step="3"> 
                        <div class="video-editor">
                            <v-row>
                                 <v-col class="mt-8 text-right mr-4">
                                    <h5>Select Video End Time</h5>
                                    <h6 class="mb-4">{{ videos[videos.length - 1].name }}</h6>
                                    <div style="width: 55%; overflow: hidden; margin-left: auto">
                                        <v-row style="background: #f2f2f2; width: 100%; padding: 0 1rem; margin: 0">
                                            <v-col>
                                                <v-text-field
                                                    readonly 
                                                    v-model="endTime.hours" 
                                                    label="Hours" />
                                            </v-col>
                                            <v-col>
                                                <v-text-field
                                                    readonly 
                                                    v-model="endTime.minutes" 
                                                    label="Minutes" />
                                            </v-col>
                                            <v-col>
                                               <v-text-field
                                                    readonly 
                                                    v-model="endTime.seconds" 
                                                    label="Seconds" />
                                            </v-col>
                                        </v-row>

                                        <div class="video-controls mt-4">
                                            <v-btn @click.stop="$refs.endTimeVideoPlayer.currentTime = 0"><chevrons-left-icon /></v-btn>
                                            <v-btn @click.stop="$refs.endTimeVideoPlayer.currentTime = ($refs.endTimeVideoPlayer.currentTime - 1)"><chevron-left-icon /></v-btn>
                                            <v-btn @click.stop="$refs.endTimeVideoPlayer.currentTime = ($refs.endTimeVideoPlayer.currentTime + 1)"><chevron-right-icon /></v-btn>
                                            <v-btn @click.stop="$refs.endTimeVideoPlayer.currentTime = $refs.endTimeVideoPlayer.duration"><chevrons-right-icon /></v-btn>
                                        </div>

                                        <v-btn @click="setEndTimestamp(true)" block class="mt-4" color="red" dark>Set End</v-btn>
                                    </div>
                                </v-col>

                                <v-col>
                                    <video ref="endTimeVideoPlayer" class="edit-video" @timeupdate="setEndTimestamp()" controls>
                                        <source :src="videos[videos.length - 1].src" type="video/mp4">
                                    </video>
                                </v-col>
                            </v-row>
                        </div>
                        <v-row>
                            <v-col>
                                <v-btn @click="e1 = 1"><chevron-left-icon size="1.5x" style="margin-right: -.7rem" /><chevron-left-icon size="1.5x" class="mr-2" />Back To Uploads</v-btn>
                                <v-btn @click="e1 = 2" class="ml-2"><chevron-left-icon size="1.5x" class="mr-2" />ReOrder videos</v-btn>
                            </v-col>
                            <v-col class="text-right">
                                <v-btn @click="setEndTimestamp(true)" color="primary">Save <chevron-right-icon size="1.5x" class="ml-2" /></v-btn>
                            </v-col>
                        </v-row>
                    </div>

                    <div v-if="e1 === 5" class="mt-4 mb-4" step="4"> 
                        <div style="width: 50%; margin: 8rem auto; text-align: center">
                            <div v-if="!uploadFinished">
                                <v-progress-linear class="mt-2 mb-6" indeterminate color="orange"></v-progress-linear>
                                <h5 v-if="!finshingUpload">Uploading Videos [{{ uploadIndex + '/' + videos.length }}]</h5>
                                <h5 v-else>Finishing up..</h5>
                                <h3><strong>PLEASE DO NOT CLOSE THIS PAGE</strong></h3>
                            </div>
                            <div v-else>
                                <h2 class="mt-2 mb-6">Upload complete</h2>
                                <v-btn @click="$router.go(-1)">Return To service</v-btn>
                            </div>
                        </div>
                    </div>
                </v-stepper-items>
            
            </div>
        </div>

        <v-overlay :value="overlay" z-index="1000001">
            <v-progress-circular
                indeterminate
                size="64"
            ></v-progress-circular>
        </v-overlay>
    </div>
</template>

<script>
import { Dashboard } from '@uppy/vue'
import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'
import Uppy from '@uppy/core'
import { ChevronLeftIcon, ChevronsLeftIcon, ChevronRightIcon, ChevronsRightIcon } from 'vue-feather-icons'
import draggable from 'vuedraggable'

export default {
    metaInfo: {
      title: 'Uploader',
    },
    data() {
        return {
            overlay: false,
            videos: [],
            token: '',
            e1: 1,
            ready: false,
            uppy: {},
            finshingUpload: false,
            uploadFinished: false,
            uploadIndex: 0,
            startTime: {
                hours: '--',
                minutes: '--',
                seconds: '--'
            },
            endTime: {
                hours: '--',
                minutes: '--',
                seconds: '--'
            }
        }
    },
    components: {
        Dashboard,
        ChevronLeftIcon,
        ChevronRightIcon,
        ChevronsLeftIcon,
        ChevronsRightIcon,
        draggable
  },
  mounted() {
        this.initUppy()

        this.$auth.getIdTokenClaims().then(result => {
            this.token = result.__raw;
        });
  },
  methods: {
      initUppy() {
          let that = this;
          this.uppy = Uppy({
            restrictions: {
                allowedFileTypes: ['.mp4']
            },
        })
        .on('file-added', (file) => {
            that.videos.push(file)
        })
        .on('file-removed', (file) => {
            that.videos = that.videos.filter(item => { return item.id != file.id });

            // that.axios
            //     .create({ headers: {'Authorization': `Bearer ${this.token}`} })
            //     .post(process.env.VUE_APP_API + `/events/createmedia/${ +this.$route.params.id }?fileName=${ item.name }&order=${ i }`)
            //     .then(response => {
            //         item.response = response.data;
            //         that.videos = that.videos.filter(item => { return item.id != file.id });
            //     })
        })
        .on('upload', (files) => {
            that.setVideoBlobs()
        })

        this.ready = true;
      },
      setVideoBlobs() {
          this.overlay = true
          this.videos.forEach((item, i) => {
              item.src = window.URL.createObjectURL(item.data); 
              item.selected = i === 0 ? true : false;        
              item.startTime = 0;
              item.endTime = 0;   
              
                this.axios
                .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                .post(process.env.VUE_APP_API + `/events/createmedia/${ +this.$route.params.id }?fileName=${ item.name }&order=${ i }`)
                .then(response => {
                    item.response = response.data;
                })
                .catch(error => {
                    console.log(error)
                })
                .then(() => {
                    // set durations
                    var reader = new FileReader();
                    reader.onload = function() {
                        var media = new Audio(reader.result);
                        media.onloadedmetadata = function(){
                            item.duration = media.duration;
                        };    
                    };
                    reader.readAsDataURL(item.data); 
                     if (i === (this.videos.length - 1)) {
                        console.log(this.videos)
                        this.overlay = false;
                        this.e1 = 2;
                    }
                }) 
          
          });
      },
      setVideo(index) {
          this.videos.forEach(video => {
              video.selected = false;
          })

          this.videos[index].selected = true;
          console.log(this.videos)
      },
      setStartTimestamp(save = false) {
          if (this.$refs.startTimeVideoPlayer) {
            let timestamp = new Date(this.$refs.startTimeVideoPlayer.currentTime * 1000).toISOString().substr(11, 8);

            this.startTime = {
                hours: timestamp.substring(0,2),
                minutes: timestamp.substring(3,5),
                seconds: timestamp.substring(6,8)
            }

            this.videos[0].start = this.$refs.startTimeVideoPlayer.currentTime;
            this.videos[0].end = this.$refs.startTimeVideoPlayer.duration;
            if (save) {
                this.e1 = 4;
                setTimeout(() => {
                    this.$refs.endTimeVideoPlayer.currentTime = this.videos[this.videos.length - 1].duration;
                })
            } 
          }
      },
      setEndTimestamp(save = false) {
          if (this.$refs.endTimeVideoPlayer) {
            let timestamp = new Date(this.$refs.endTimeVideoPlayer.currentTime * 1000).toISOString().substr(11, 8);
            console.log(timestamp)

            this.endTime = {
                hours: timestamp.substring(0,2),
                minutes: timestamp.substring(3,5),
                seconds: timestamp.substring(6,8)
            }

            this.videos[this.videos.length - 1].end = this.$refs.endTimeVideoPlayer.currentTime;
            if (save) {
                this.e1 = 5;
                this.startSavingFiles();
            }
          }
      },
      startSavingFiles() {
          console.log('starting video upload')
          this.videos.forEach((video, i) => {
              this.saveVideo(video.data, video.response.sas, i, this.videos.length);
          })
      },
      saveVideo(file, blobUrl, index, count) {
            let _ = this;
            let reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.addEventListener("load", function () {

                console.log(blobUrl)
                _.axios
                    .create({ 
                    headers: {
                        'Content-Type': file.type,
                        'x-ms-blob-type': 'BlockBlob'
                    } 
                    })
                    .put( blobUrl , reader.result )
                    .then(response => {
                        _.uploadIndex++;
                           console.log('done with ' + index)
                        if (_.uploadIndex === count) {
                            _.finshingUpload = true;
                            _.saveRenderObject();
                        }
                    })
                    .catch(error => {
                        console.log(error)
                        console.log('error uploading ' + index)
                    })
                    .then(() => {
                    })
            });
        },
      goToTimestamps() {
        this.overlay = true;
        this.videos.forEach((video, i) => {
            this.axios
            .create({ headers: {'Authorization': `Bearer ${this.token}`} })
            .post(process.env.VUE_APP_API + `/events/media/order/${ video.response.id }?order=${ i }`)
            .then(response => {
                console.log(response)
            })
            .catch(error => {
                console.log(error)
            })
            .then(() => {
                if (i === (this.videos.length - 1)) {
                    this.overlay = false;
                    this.e1 = 3;
                }
            })
        })
      },
      saveRenderObject(index) {
          let mediaArr = []
          let duration = this.videos.reduce((accum, item) => accum + item.duration, 0)

          this.videos.forEach((video, i) => {
              mediaArr.push({
                  id: video.response.id,
                  name: video.name,
                  url: video.response.sas,
                  order: i,
                  mediaType: 1
              })
          }) 
          let data = {
            eventId: +this.$route.params.id,
            medias: mediaArr,
            videoQueType: 0,
            start: this.videos[0].start,
            stop: duration - (this.videos[this.videos.length - 1].duration - this.videos[this.videos.length - 1].end)
          }

            this.axios
                .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                .post(process.env.VUE_APP_API + `/render/create`, data)
                .then(response => {
                    console.log(response)
                    this.uploadFinished = true;
                })
                .catch(error => {
                    console.log(error)
                })
      }
  },
  beforeDestroy () {
    this.uppy.close()
  }
}
</script>

<style lang="scss">
    .uploader {
        .uppy-Dashboard-inner {
            margin: 0 auto;
        }

        .video-drag {
            margin: 1.5rem 0;

            .drag-item {
                padding: 1rem;
                display: inline-block;
                margin: 1rem 1%;
                width: 31%;
                text-align: center;
            }

            video {
                width: 100%;
            }
        }

        .video-list {
            margin: 0;
            padding: 0;

            li {
                padding: .5rem;
                display: inline-block;
                margin: 1rem;
                transition: .3s ease-in-out;

                video {
                     transition: .3s ease-in-out;
                }

                &.selected {
                    background: #f7f7f7;
                    border-radius: 5px;
                    cursor: default;

                    video {
                        height: 14rem;
                    }
                }

                &:hover:not(.selected) {
                    background: #f4f4f4;
                    cursor: pointer;

                    transform: scale(1.05);
                }
            }
        }

        .video-editor {
            margin: 2rem 0;

            .edit-video {
                width: 100%;
            }

            .video-controls {
                display: flex;
                justify-content: space-between;
            }
        }
    }
</style>