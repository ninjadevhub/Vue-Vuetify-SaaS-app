<template>
    <div>
        <side-nav></side-nav>
        <div v-bind:class="[{ 'menu-showing': this.$store.state.menuShowing }, 'dash-container']">
            <div class="tile elevation-6">
                <div class="header">
                    <h4>Live Streams</h4>
                </div>

                <div v-if="loading" class="loading-container">
                    <v-progress-circular :size="64" color="#FF530D" indeterminate class="spinner"></v-progress-circular>
                    <p>getting streams</p>
                </div>

                <div v-if="!loading && !totalStreams" class="empty-streams-container">
                    <h2>No active streams</h2>
                </div>

                <div class="video-boxes-container">
                    <div v-for="item in streams" :key="item.info.id" class="video-box">
                        <div class="pa-2">
                            {{ item.event ? item.event.title : 'Title' }}
                        </div>
                        <div v-show="item.showingAnalytics" class="placeholder">
                            <line-chart v-show="item.chartReady" :chart-data="item.datacollection" height="240" :options="options" ref="chart"></line-chart> 
                            <div v-if="!item.chartReady" class="text-center mt-4">
                                <v-progress-circular :size="64" color="#FF530D" indeterminate class="spinner"></v-progress-circular>
                            </div>
                        </div>
                        <video v-show="!item.showingAnalytics" :id="`videoPlayer-${item.info.id}`" class="video-js vjs-big-play-centered" controls>
                            <source :src="item.info.hlsPlayerUrl" type="application/x-mpegURL">
                        </video>
                        <v-row class="pa-4">
                            <v-col>
                                {{ streamStates[item.info.state] }}
                            </v-col>
                            <v-col class="text-right">
                                <bar-chart-icon v-if="!item.showingAnalytics" @click="toggleAnalytics(item)" size="1.5x" class="analytics-btn"></bar-chart-icon>
                                <film-icon v-else @click="toggleAnalytics(item)" size="1.5x" class="analytics-btn"></film-icon>
                            </v-col>
                        </v-row>
                    </div>
                </div>

                <div class="text-right mt-4 mb-4">
                    <h6>total: {{ totalStreams }}</h6>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import videojs from 'video.js';
import 'video.js/dist/video-js.min.css';
import 'videojs-share/dist/videojs-share.css'
import 'videojs-contrib-hls';
import Spinner from '../components/Spinner';
import { BarChartIcon, FilmIcon } from 'vue-feather-icons'
import LineChart from '../components/charts/LineChart';

export default {
    metaInfo: {
      title: 'Live Streams',
    },
    data() {
        return {
            token: '',
            streams: [],
            height: 24,
            totalStreams: 0,
            loading: true,
            streamStates: ['Created', 'Streaming', 'Paused', 'Live', 'Completed'],
            options: {
                responsive: true,
                maintainAspectRatio: false,
            }
        }
    },
    mounted() {
        this.$auth.getIdTokenClaims().then(result => {
             this.token = result.__raw;
             this.getStreams();
            // this.getLiveCount();
        });
    },
    created() {
        this.$socket.start({
         log: true // Active only in development for debugging.
        });
    },
    sockets: {
        NotifyLive(data) {
            this.getStreams()
        },
    },
    methods: { 
        getStreams() {
            this.streams = [];
            this.loading = true;

            this.axios
                .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                .get(process.env.VUE_APP_API + `/live/dashboard`)
                .then(response => {
                    console.log('----')
                    console.log(response)
                    //this.streams = response.data.streamObject;
                    this.totalStreams = response.data.total;
                   
                        response.data.streamObject.forEach(item => {
                            item.showingAnalytics = false;
                            item.chartReady = false;
                            item.data = {
                                labels: [],
                                inboundData: {
                                    label: 'Inbound Bitrate (Kbps)',
                                    borderColor: "rgba(255,83,13,.7)",
                                    backgroundColor: 'rgba(0,0,0,0)',
                                    data: []
                                },
                                outboundData: {
                                    label: 'Outbound Bitrate (Kbps)',
                                    borderColor: "rgba(25,83,13,.7)",
                                    backgroundColor: 'rgba(0,0,0,0)',
                                    data: []
                                },
                                framerateData: {
                                    label: 'Frame Rate (FPS)',
                                    borderColor: "rgba(25,200,13,.7)",
                                    backgroundColor: 'rgba(0,0,0,0)',
                                    data: []
                                },
                                keyframeData: {
                                    label: 'Keyframe Interval(GOP)',
                                    borderColor: "rgba(25,25,25,.7)",
                                    backgroundColor: 'rgba(0,0,0,0)',
                                    data: []
                                },
                            }

                            if (this.$auth.role === 'SuperAdmin') {
                                this.axios
                                .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                                .get(process.env.VUE_APP_API + `/FuneralHomes/${ item.info.funeralHomeId }`)
                                .then(response => {
                                    if (response.data) {
                                        // set the funeral home name on the stream object ehre
                                    }
                                })
                            }

                            this.streams.push(item)                          
                            // videojs('videoPlayer-' + item.info.id, {})
                        })

                        let x = document.querySelectorAll('video')
                        console.log(x)

                        setTimeout(() => {
                            let videoNodes = document.querySelectorAll('video')
                            videoNodes.forEach(video => {
                                console.log(video.id)

                                videojs(video.id, {}, function onPlayerReady() {
                                    this.play();
                                })
                            })
                        }, 1000)
                })
                .catch(error => {
                    console.log(error)
                    console.log(error.reponse)
                })
                .then(() => {
                    this.loading = false;
                })
        },
        getHealthRecords(item) {
            console.log(item)
            this.axios
                .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                .get(process.env.VUE_APP_API + `/live/get-health-records/${ item.info.id }`)
                .then(response => {
                    if (response.data.uptimes) {
                        this.getLiveChart(item, response.data.uptimes[response.data.uptimes.length - 1]);
                    } 
                })
                .catch(error => {
                    console.log(error)
                })
                .then(() => {
                })
        },
        getLiveChart(chart, record) {
            console.log('getting chart')
            // live chart doesnt have a time stamp
            this.axios
                .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                .get(process.env.VUE_APP_API + `/live/get-health-chart/${ chart.info.id }?uptimeRecordId=${ record.id }`)
                .then(response => {
                    response.data.history.forEach(item => {
                        if (item.created_at) chart.data.labels.push(this.$moment(item.created_at).format('LT'))
                        if (item.bits_in_rate) chart.data.inboundData.data.push(item.bits_in_rate.value)
                        if (item.bits_out_rate) chart.data.outboundData.data.push(item.bits_out_rate.value)
                        if (item.frame_rate) chart.data.framerateData.data.push(item.frame_rate.value)
                        if (item.keyframe_interval) chart.data.keyframeData.data.push(item.keyframe_interval.value)
                    })
    
                    chart.datacollection = {
                        labels: chart.data.labels,
                        datasets: [
                            chart.data.inboundData,
                            chart.data.outboundData,
                            chart.data.framerateData,
                            chart.data.keyframeData
                        ]
                    }
                    chart.chartReady = true;
                })
        },
        toggleAnalytics(item) {
            item.showingAnalytics = !item.showingAnalytics;

            if (item.showingAnalytics) {
                this.getHealthRecords(item)
            }
        }
    },
    components: {
        Spinner,
        BarChartIcon,
        FilmIcon,
        LineChart
    }
}
</script>

<style lang="scss" scoped>
    .loading-container {
        text-align: center;
        margin: 8rem 0;
    }

    .video-boxes-container {
        display: flex;
        justify-content: space-around;
        flex-wrap: wrap;
    }

    .video-box {
        width: 31%;
        margin: .5rem 0;
        //flex: 1 1 30%;
        background: #f8f8f8;

        .placeholder {
            height: 16rem;
            overflow: hidden;
            text-align: center;
            background: #f2f2f2;
            line-height: 16rem;
            position: relative;
        }
    }

    .video-js {
        width: 100%;
        height: 16rem;
    }   

    #line-chart {
        height: 16rem;
    }

    .empty-streams-container {
        height: 14rem;
        margin: 2rem 0 0 2.5%;
    }

    .analytics-btn {
        cursor: pointer;
        padding: .25rem;
        transition: .3s ease-in-out;

        &:hover {
            background: #d8d8d8;
            border-radius: 50%;
        }
    }
</style>