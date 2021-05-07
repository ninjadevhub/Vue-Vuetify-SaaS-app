<template>
    <div class="live-preview-container">
        <div v-if="loading" class="pt-12 text-center">
            <v-progress-circular :size="64" color="#FF530D" indeterminate class="spinner"></v-progress-circular>
            <p>Waiting for stream to start</p>
        </div>

        <video v-else ref="videoPlayer" class="video-js vjs-big-play-centered" />
    </div>
</template>

<script>
import videojs from 'video.js';
import videoJsShare from 'videojs-share';
import 'videojs-flash';
import 'videojs-markers';
import 'videojs-contrib-hls';
import 'video.js/dist/video-js.min.css';

export default {
    props: ['service'],
    data() {
        return {
            slug: {},
            player: null,
            loading: true,
            playbackError: false
        }
    },
    methods: {
        init() {
            this.getServiceBySlug();
        },
        initVideo() {
            let _ = this;
            this.options = {
                autoplay: false,
                controls: true,
                controlBar: {
                    children: [
                        "playToggle",
                        "currentTimeDisplay",
                        "progressControl",
                        "volumePanel",
                        "fullscreenToggle"
                    ]
                }
            }

            this.player = videojs(this.$refs.videoPlayer, this.options, function onPlayerReady() {
                console.log('onPlayerReady', this);

                _.player.src({ type: 'application/x-mpegURL', src: _.slug.liveURL })
                _.player.play();
            })
        },
        getServiceBySlug() {
            this.axios
                .get(`https://api.memoryshare.com/api/services/view/${ this.service.slug }`)
                .then(response => {
                    this.loading = false;
                    console.log('slug')
                    console.log(response.data)
                    this.slug = response.data;
                    this.initVideo();
                })
                .catch(error => {
                    console.log(error)
                    console.log(error.response)
                })
        }
    }
}
</script>

<style lang="scss" scoped>
    .video-js {
        width: 22rem !important;
        height: 18rem !important;
    }
    .live-preview-container {
        min-height: 14em;
    }
</style>