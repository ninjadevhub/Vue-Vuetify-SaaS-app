<template>
<div>
    <div v-show="!loading">
        <div v-if="!hideMenu" :class="[{ 'live-padding': live }, 
                                       { 'created-container': service.serviceState === 0 || service.serviceState === 1 }, 
                                       { 'private': blocked },
                                       'video-container', 'd-flex']">
                <div v-show="!live" class="video-options">
                    <div class="video-header">{{ videoStatus }}</div>
                    <ul>
                        <li v-for="(item, index) in sortedEvents" :class="{ 'active': item.active, 'ready': item.convertedVideo }" :key="item.index" @click="setActiveVideo(index, true, true)">
                            <div class="options-icon d-inline-block">
                                <span class="event-icon">
                                    <!-- not current video play button placeholder -->
                                    <lock-icon v-if="!item.active && item.private && (!item.convertedVideo || !item.liveURL )" class="play ease"></lock-icon>
                                    <play-icon v-if="!item.active && (item.convertedVideo || item.liveURL )" class="play ease"></play-icon>

                                    <!-- active video icons -->
                                    <play-icon v-if="item.active && videoStatus === 'Paused' && !blocked" class="play ease"></play-icon>
                                    <lock-icon v-if="item.active && videoStatus === 'Paused' && blocked" class="play ease"></lock-icon>
                                    <pause-icon v-if="item.active && videoStatus === 'Playing'" class="play ease"></pause-icon>
                                    <loader-icon v-if="item.active && (videoStatus === 'Loading' || videoStatus === 'Preparing next video' )" class="play ease spin"></loader-icon>
                                </span>
                            </div>
 
                            <div class="options-content d-inline-block">
                                <small v-if="!item.active && item.convertedVideo && index === (currentVideoIndex + 1)" class="next-in-queue">Next in queue</small>
                                <h6 :class="[{ 'upcoming': !item.convertedVideo }, 'mb-0']">{{ item.title }}</h6> 
                                <small v-if="item.time !== minDate" class="time-callout">{{ item.time | moment("lll") }}</small>
                                <small v-if="item.time === minDate && item.eventType !== 0" class="time-callout">awaiting time</small>
                                <p v-if="item.private" class="mb-0" style="opacity: .7; font-size: .7rem">PRIVATE</p>
                            </div>
                        </li>
                    </ul>

                    <div v-if="service.serviceState === 0 || service.serviceState === 1">
                        <ul>
                            <li>
                                <h2 class="service-title">Service for {{ service.firstName + ' ' + service.lastName }}</h2>
                            </li>
                            <li v-for="item in events" :key="item.index">
                                <h3>{{ item.title }}</h3>
                                <h5 v-if="item.time !== minDate" class="time-callout">{{ item.time | moment("lll") }}</h5>
                                <h5 v-if="item.time === minDate && item.eventType !== 0" class="time-callout">awaiting time</h5>
                            </li>
                        </ul>

                        <img v-if="service.pictureURL" :src="service.pictureURL" class="corner-img url" alt="">
                        <img v-else src="https://d1pnnwteuly8z3.cloudfront.net/images/1fde3b9d-4dc8-422c-8e23-bbe443fd0870/b2f06338-a853-4f8c-b19f-7265e27df50e.png" alt="family" class="corner-img">
                    </div>


                    <div v-if="upcomingEvents.length" class="text-left">
                        <h5 class="upcoming-callout">Upcoming</h5>
                    </div>

                    <ul>
                        <li v-for="item in upcomingEvents" :key="item.index">
                            <div class="options-icon d-inline-block">
                                <!-- upcoming -->
                                <span class="event-icon">
                                    <clock-icon v-if="!item.convertedVideo && !item.live" class="upcoming ease"></clock-icon>
                                     <span v-else class="live-callout">LIVE</span> 
                                </span>
                            </div>

                             <div class="options-content d-inline-block">
                                <h6 :class="[{ 'upcoming': !item.convertedVideo }, 'mb-0']">{{ item.title }}</h6> 
                                <small v-if="item.time !== minDate" class="time-callout">{{ item.time | moment("lll") }}</small>
                                <small v-else class="time-callout">awaiting time</small>
                            </div>
                        </li>
                    </ul>
                </div>
                
                <div class="private-callout">
                    <h2>This is a Private Viewing</h2>
                    <h4>Please enter to PIN to view</h4>
                    <div class="pin-container">
                        <v-text-field v-model="privatePIN" color="#AB0658" style="margin-bottom: -1rem" ref="privatePin" label="Enter pin"></v-text-field>
                        <p class="error-text">{{ privatePINError }}</p>
                        <v-btn @click="verifyPrivatePin" small :disabled="!privatePIN.length">submit</v-btn>
                    </div>
                </div>
                <video ref="videoPlayer" class="video-js vjs-big-play-centered" controls></video>

                <!-- <div v-if="liveObject"  class="live-details">
                    <h3>{{ liveObject.title }}</h3>
                </div> -->

                <div v-if="awaitingLiveStream" class="stream-buffer mt-12">
                    <!-- <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular> -->
                    <p class="mt-4" style="color: #fff">Waiting for stream to start...</p>
                </div>
                
            </div>

            <div v-else>
                <video ref="videoPlayer" class="video-js vjs-big-play-centered" controls></video>
                 <div v-if="awaitingLiveStream" class="stream-buffer">
                    <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
                    <p class="mt-4" style="color: #fff">Waiting for stream to start...</p>
                </div>
            </div>
    </div>
    <div v-show="loading" class="video-container">
        <div class="stream-buffer">
            <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
            <p class="mt-4" style="color: #fff">Loading...</p>
        </div>
    </div>
    </div>
</template>

<script>
import videojs from 'video.js';
import videoJsShare from 'videojs-share';


 import 'videojs-flash';
// import 'videojs-markers';
//  import 'videojs-contrib-hls';
// require('@silvermine/videojs-chromecast')(videojs, { preloadWebComponents: true });
import 'video.js/dist/video-js.min.css';
import 'videojs-share/dist/videojs-share.css'
// import 'videojs-markers/dist/videojs.markers.min.css'
import { PlayIcon, PauseIcon, ClockIcon, LoaderIcon, LockIcon } from 'vue-feather-icons'

export default {
    data() {
        return {
            loading: true,
            options: {},
            showMenu: false,
            player: null,
            videoStatus: 'Paused',
            src: '',
            type: 'video/mp4',
            currentVideoIndex: 0,
            videoLength: 0,
            loaded: false,
            live: false,
            minDate: '0001-01-01T00:00:00',
            sortedEvents: [],
            upcomingEvents: [],
            awaitingLiveStream: false,
            liveStreamUrl: '',
            liveObject: {},
            service: {},
            startTimestamp: 0,
            endTimeStamp: 0,
            durationTotal: 0,
            currentEvent: {},
            privatePIN: '',
            privatePINError: '',
            blocked: false,
            previewTextEl: ''
        }
    },
    props: ['srcArr', 'events', 'ready', 'hideMenu', 'playerOptions', 'setEventId', 'role', 'slug', 'skipLivePreview'],
    beforeDestroy() {
        if (this.player) {
            this.player.dispose()
        }
    },
    methods: {
        initVideoJs() {
            let _ = this;      

            this.options = {
                autoplay: false,
                controls: true,
                errorDisplay: false,
                height: this.playerOptions.height && this.playerOptions.playerOnly ? this.playerOptions.height : '',
                width: this.playerOptions.width && this.playerOptions.playerOnly  ? this.playerOptions.width : '',
                fluid: this.playerOptions.fluid && this.playerOptions.playerOnly  ? true : false,
                liveui: true,
                // seekToLiveEdge: true,
                techOrder: ["html5"],
                //techOrder: ['chromecast', 'html5'],
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

            let shareOptions = {
                socials: ['fb', 'tw', 'reddit', 'gp', 'messenger', 'linkedin', 'telegram', 'whatsapp', 'viber', 'vk', 'ok', 'mail'],
                url: window.location.href,
                title: 'videojs-share',
                description: 'video.js share plugin',
                image: 'https://dummyimage.com/1200x630',
                // required for Facebook and Messenger
                fbAppId: '12345',
                // optional for Facebook
                redirectUri: window.location.href + '#close',
                // optional for VK
                isVkParse: true,        
                // optinal embed code
                embedCode : '<iframe src="' + window.location.href + '" width="560" height="315" frameborder="0" allowfullscreen></iframe>'
            }


            this.player = videojs(this.$refs.videoPlayer, this.options, function onPlayerReady() {
                _.setServiceState(); 

                let liveTile = this.addChild('Component', {})
                liveTile.addClass('live-tile')

                let img = this.controlBar.addChild('Component', {}, 12)
                img.addClass("video-logo");

                // _.previewTextEl = this.addChild('div', { text: 'suh' })
                // _.previewTextEl.addClass("preview-text");
            })

            this.player.share(shareOptions);

            this.player.on('play', () => {
                this.startTimestamp = this.player.currentTime();
                this.trackTime()
                this.trackAnalytics(false)
            })

            this.player.on('pause', () => {
                this.endTimeStamp = this.player.currentTime();
                this.trackTime()
                this.trackAnalytics(true)
            })

            this.player.on('waiting', () => {
                _.videoStatus = 'Loading'
            })

             this.player.on('timeupdate', (time) => {
                this.videoStatus = this.player.paused() ? 'Paused' : 'Playing';
            })

            this.player.on('ended', () => {
                _.trackAnalytics();
                _.durationTotal = 0;
                _.currentVideoIndex = _.sortedEvents.findIndex(item => item.active === true);

                if (_.currentVideoIndex < (_.videoLength - 1)) {
                    _.videoStatus = "Preparing next video"
                    _.currentVideoIndex++;
                    _.setActiveVideo(_.currentVideoIndex)
                } else {
                    console.log('start pre roll ')
                }
            })


        },
        startStreamBuffer() {
            this.loading = false;
            this.setLiveSteam();

            // we can assume its a live stream playback error here
            if (this.service.serviceState === 2) {
                this.player.on('error', () => {
                this.awaitingLiveStream = true;
                    setTimeout(() => {
                        this.setLiveSteam();
                    }, 10000)
                    return;
                });
            }
        },
        setLiveSteam() {
            // hit singnal r here
            console.log('set live streaem')
            console.log(this.liveObject)
            console.log(this.skipLivePreview)
            
            //this.liveObject.eventStatus === 1 && 
            if (this.liveObject.eventStatus !== 3 && this.skipLivePreview) {
                this.setPreviewText(this.liveObject.previewText || 'Stream starting soon')
                return
            }

            var liveSrc = this.service.liveURL;
            this.player.src({ type: 'application/x-mpegURL', src: liveSrc })
            this.awaitingLiveStream = false;

            // set current playback
            this.player.on('loadedmetadata', function(item) {
                if (this.duration() - 10 > 0) {
                    this.currentTime(this.duration())
                }
            });

            this.player.play()
        },
        jumpToTime(time) {
            this.player.currentTime(time);
        },
        setServiceState() {
            console.log('****** SEREVICE STATE ' + this.service.serviceState)

            switch(this.service.serviceState) {
                case 0: 
                    this.setCreated();
                    //hide comments
                    break;
                case 1: 
                    this.setCreated();
                    //hide comments
                    break;
                case 2: 
                    this.goLive();
                    break;
                case 4: 
                    this.loading = true;
                    this.setVideoList(true);
                    break;
                case 6: 
                    this.goLive();
                    break;
                default:
                    this.loading = true;
                    this.setVideoList();
                    break;
            }
        },
        setCreated() {
            this.loading = false;  
            this.player.hide();
        },
        trackTime() {
            // get time just watched
            let elapsedTime = (+this.endTimeStamp - +this.startTimestamp)
            if (elapsedTime > 0) {
                this.durationTotal = this.durationTotal + elapsedTime;
            }
        },
        setVideoList(setVideo){
            this.live = false;
            this.awaitingLiveStream = false
            let now = new Date().toISOString();
            this.sortedEvents.splice(0);

            this.events.forEach((item, index) => {   
                if (item.convertedVideo || item.liveURL) {
                    // add to sorted events
                    this.sortedEvents.push(item);
                } else if (item.private && item.time < now) {
                    this.sortedEvents.push(item)
                } else {
                    // add to upcoming events
                    if (item.eventType !== 0 ) this.upcomingEvents.push(item)
                }

                this.videoLength = this.sortedEvents.length;
                this.sortedEvents = this.sortedEvents.slice().sort(function(a, b) {
                    return (a===null)+(b===null) || -(new Date(a.time).getTime()<new Date(b.time).getTime())||+(new Date(a.time).getTime()>new Date(b.time).getTime());
                });

                this.upcomingEvents = this.upcomingEvents.slice().sort(function(a, b) {
                    return (a===null)-(b===null) || -(new Date(a.time).getTime()>new Date(b.time).getTime())||+(new Date(a.time).getTime()<new Date(b.time).getTime());
                });

                if (!this.live && index === (this.events.length - 1)) this.loading = false;  
     
            })

            // let tributeVideo = this.events.find(x => x.eventType === 0);
            // if (tributeVideo.convertedVideo) this.sortedEvents.unshift(tributeVideo)
            if (setVideo) this.setActiveVideo(0, true, false)
            this.currentEvent = this.sortedEvents[0];
            if (this.currentEvent.private) this.blocked = true;
            this.loading = false;
        },
        setActiveVideo(index, autoStart = true, listItemClickEvent = false) {
            if (listItemClickEvent) {
                // check if video clicked is the active video
                let activeIndex = this.sortedEvents.findIndex(item => item.active === true);
                if (index === activeIndex) {
                    // check if video is playing, if so pause
                    if (this.videoStatus === 'Playing') {
                        this.player.pause();
                    } else if (this.videoStatus === 'Paused') {
                        this.player.play();
                    }
                    return;
                }
            }

            this.sortedEvents.forEach(item => item.active = false);
            if (this.sortedEvents[index]) {
                this.sortedEvents[index].active = true;  
                this.currentEvent = this.sortedEvents[index];
                //UNCOMMENT FOR COMMENTS
                //this.$emit('updateId', this.currentEvent.id);

                if (this.currentEvent.private && !this.currentEvent.convertedVideo) {
                    this.blocked = true
                } else {
                    this.player.src({ 
                        type: this.sortedEvents[index].live ? 'application/x-mpegURL' : 'video/mp4', 
                        src: this.sortedEvents[index].live ? this.sortedEvents[index].liveURL : this.sortedEvents[index].convertedVideo
                    })

                    if (autoStart) this.player.play(); 
                }
            }   
        },
        trackAnalytics(paused) {
            if (this.durationTotal > this.player.duration()) {
                this.durationTotal = this.player.duration()
            }

            let data = {
                eventId: this.live ? this.service.currentLiveEventId : this.currentEvent.id,
                start: this.startTimestamp,
                end: paused ? this.player.currentTime() : 0,
                duration: paused ? this.durationTotal : 0,
                live: this.live ? true : false,
                slug: this.slug
            }

            this.axios
                .post(`https://api.memoryshare.com/api/dogs/track`, data)
                .then(response => {
                    
                })
                .catch(error => {
                    console.log(error)
                    console.log(error.response)
                })
        },
        goLive() {
            console.warn('GO LIVE')
            this.blocked = false;
            this.live = true;
            this.liveObject = this.events.find(x => x.id === this.service.currentLiveEventId);
            if (this.liveObject.private) this.blocked = true;
            this.awaitingLiveStream = true;
            // this.startStreamBuffer();
            this.setLiveSteam();
            // UNCOMMENT FOR COMMENTS
            //this.$emit('updateId', this.service.currentLiveEventId)  
            console.log('live object', this.liveObject)

        },
        verifyPrivatePin() {
            this.privatePINError = '';

            this.axios
                .get(`https://api.memoryshare.com/api/events/get/private/${ this.slug }?eventId=${ this.currentEvent.id }&pin=${ this.privatePIN }`)
                .then(response => {
                    this.blocked = false;

                    let eventItem = this.sortedEvents.find(x => x.id === response.data.id);
                    if (eventItem.live) {
                        eventItem.liveURL = response.data.liveURL
                    } else {
                        eventItem.convertedVideo = response.data.convertedVideo;
                    }

                    // set video
                    this.player.src({ 
                        type: eventItem.live ? 'application/x-mpegURL' : 'video/mp4', 
                        src: eventItem.live ? eventItem.liveURL : eventItem.convertedVideo
                    })
                })
                .catch(error => {
                    console.log(error)
                    console.log(error.response)
                    this.privatePINError = 'Invalid PIN. Please try again.'
                })
        },
        setPreviewText(text) {
            let el = document.createElement("div");
            el.innerHTML = text;
            el.classList = 'preview-text'
            this.player.el().appendChild(el)
        }
    },
    components: {
        PlayIcon,
        PauseIcon,
        ClockIcon,
        LockIcon,
        LoaderIcon
    },
}
</script>

<style lang="scss">

    .created-container {
        .video-header {
            display: none;
        }

        .service-title {
            width: 70%;
            text-align: center;
            border-bottom: 1px solid rgba(255,255,255,.7);
        }

        .video-options {
            width: 50% !important;
            margin: 0 auto;

            .service-title {
                font-size: 2rem;
                font-weight: 400;
            }

            h3 {
                font-size: 1.75rem;
                margin-bottom: .5rem;
                font-weight: 300;
                line-height: 1.2;
            }

            .time-callout {
                margin-bottom: .5rem;
                font-weight: 300;
                line-height: 1.2;
                font-size: 1.2rem;
            }

            li:hover {
                background: transparent;
                cursor: default;
            }
        }

        .corner-img {
            position: absolute;
            bottom: 2rem;
            right: 2rem;
            height: 64vh;
            width: auto;

            &.url {
                border-radius: 50%;
                height: 32rem;
                width: 28rem;
                object-fit: cover;
                right: 6rem;
            }
        }
    }

    .preview-text {
        background: #333;
        min-height: 16rem;
        line-height: 16rem;
        font-size: 2.4rem;
        min-width: 70%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 100001;
        transition: .3s ease-in-out;
    }

    .live-tile {
        width: 2rem;
        //margin: rem 0 0 2rem;
        opacity: 0;
        display: none;
        transition: .3s ease-in-out;

        &:after {
            content: 'LIVE';
            font-size: 1.1rem;
            font-weight: 500;
            background: #d1152c;
            padding: .25rem .5rem;
            display: inline-block;
            margin: 2rem 0 0 2rem;
        }
    }

    .live-padding .live-tile {
        display: block;
    }

    .live-details {
        // position: absolute;
        top: 1rem;
        color: #fff;

        .live-dot {
            height: .8rem;
            width: .8rem;
            border-radius: 50%;
            background: #fff;
            opacity: .5;
            display: inline-block;
            vertical-align: middle;
            margin-right: .5rem;
        }

        h3 {
            font-size: 1.75rem;
            font-weight: 400;
            margin: 0;
        }

        h4 {
            font-size: 1.25rem;
            vertical-align: middle;
        }
    }

    .vjs-paused {
        & .live-tile {
            opacity: 1;
        }
    }

    .video-js {
        margin: 0 auto;
        position: relative !important;
        order: 2;

        &:hover .live-tile {
            opacity: 1;
        }

        &:hover .vjs-big-play-button {
            background: #AB0658;
            border-color: #AB0658;
            border-radius: 5px;
            opacity: 1;
        }

        // placeholder play button
        .vjs-big-play-button {
            background: #AB0658;
            border-color: #AB0658;
            border-radius: 0;
            color: #fff;
            font-size: 4rem;
            padding: 1rem 4rem;
            height: 6rem;
            opacity: .9;
            line-height: 6rem;
        }

        // control bar
        .vjs-control-bar {
            background-color: #1d1d1d;
            padding: 0 1rem;
            height: 3.75rem;
        }

        // slider
        .vjs-slider {
            height: 1.75rem;
            background: #474D56;
        }

        // volume slider
        .vjs-volume-control .vjs-slider {
            height: .2rem;
        }

        .vjs-play-control .vjs-icon-placeholder:before,
        .vjs-current-time,
        .vjs-fullscreen-control .vjs-icon-placeholder:before {
            line-height: 3.75rem;
        }

        .vjs-mute-control {
            margin-top: .95rem;
        }

        .vjs-volume-control {
            margin-top: 1rem;
        }

        .vjs-play-progress {
            background: #AB0658;
        }

        // play button
        .vjs-play-control {
            font-size: 1rem;
            width: 1.5rem;
        }

        // share-button
        .vjs-icon-share {
            font-size: 1rem;
        }

        // current time
        .vjs-current-time {
            display: block;
        }

        .video-logo {
            width: 7rem;
            background: url('../assets/images/logo_text.png') no-repeat 50%;
            background-size: contain;
            filter: invert(100%);
        }

        .vjs-chromecast-button {
            width: 3.25rem;
            padding-bottom: .4rem;

            &:before {
                content: "⎚";
                color: #fff;
                font-size: 1.8rem;
                vertical-align: super;
            }
        }
    }

    .error-text {
        margin: 0;
        opacity: .7;
        font-size: .9rem;
        color: #d1152c;
    }

         .video-options-menu {
            position: absolute;
            top: 8rem;
            left: 5rem;
            background: #1d1d1d;
            min-width: 16rem;
            color: #fff;
            border-radius: 5px;

            .video-header {
                background: #AB0658;
                padding: 1rem;
                text-align: center !important;
                margin: 0;
                font-weight: 800;
                border-radius: 5px;
            }

            .video-options {
                padding: 0;
                margin: .75rem 0;
                list-style: none;
                text-align: left;

                svg {
                    color: #AB0658;
                    fill: #AB0658;
                    margin-right: 1rem;
                }

                li {
                    margin: .1rem 0;
                    padding: .6rem 1rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: .3s ease-in-out;

                    &:hover {
                        background: rgba(255,255,255,.2);
                    }
                }

                .active {
                    background: rgba(255,255,255,.3);
                }
            }
        }

        // Markers
        .vjs-marker {
            width: 3px !important;
            border-radius: 0 !important;
            background-color: rgba(255,255,255,.75) !important;
            height: 2.3rem !important;
            transition: .3s ease-in-out;

            &:hover {
                height: 3.5rem !important;
            }
        }

        .vjs-tip {
            background: rgba(255,255,255,.75);
            border-radius: 5px;
            bottom: 4rem;

            .vjs-tip-inner {
                background: unset;
                font-size: 1.1rem;
                color: #000;
            }

            .vjs-tip-arrow{
                display: none;
            }
        }

    .video-container {
        // margin-top: rem;
        text-align: center;
        background: #333;
        height: 82vh;
        width: 100%;
        padding: 3rem 1rem;
        margin-top: 1.5rem;
        position: relative;

        &.live-padding {
            height: auto;
        }

         .vjs-tech {
                //display: none;
            }

         .video-js {
            margin: 0 auto;
            position: relative !important;
            width: 74vw !important;
            height: 72vh !important;
         }

        h6 {
            font-size: 1rem;
        }
    }

    .video-options {
        width: 20vw !important;
        margin-right: 2.5vw;
        overflow-y: auto;
        order: 1;
        
        ul {
            padding: 0 !important;
            list-style: none;
            margin: 0;
            text-align: left;
        }

        li {
            color: #fff;
            padding: 1rem .5rem;
            margin: .5rem 0;
            cursor: pointer;
            transition: .3s ease-in-out;

            &:hover {
                background: rgba(255,255,255,.2);
            }

            &.active {
                background: rgba(255,255,255,.3);
                border-radius: 5px;
            }
        }

        .video-header {
            background: #AB0658;
            padding: 1rem;
            text-align: center !important;
            margin: 0 0 1rem;
            font-weight: 800;
            border-radius: 5px;
            color: #fff;
        }
    }

     .live-callout {
        background: #ab0658;
        border-radius: 5px;
        padding: .25rem;
        font-size: .7rem;
        color: #fff;
        margin: 0 .25rem 0 -.5rem;
        vertical-align: middle;
    }

    .options-icon,
    .options-content {
        vertical-align: middle;
    }

     .event-icon {
        width: 2rem;
        margin-right: .75rem;
    }

    .time-callout {
        opacity: .5;
    }

    .upcoming {
        opacity: .85;
        line-height: 1rem;
    }

    .upcoming-callout {
        font-size: 1.3rem;
        color: #fff;
        margin: 2rem 0 0;
        border-bottom: 1px solid #888;
        padding: .5rem 1rem;
        opacity: .7;
    }

    .next-in-queue {
        opacity: .5;
    }

    .private .private-callout {
        display: block;
    }

    .private-callout {
        display: none;
        position: absolute;
        z-index: 11;
        background: #000;
        color: #fff;
        right: 2rem;
        width: 74vw !important;
        height: 72vh !important;
        padding: 10% 0 0;

        .pin-container {
            background: #fff;
            width: 30%;
            margin: 1rem auto;
            border-radius: 12px;
            padding: 1rem;
            
            input {
                font-size: 2rem;
                letter-spacing: 2px;
                max-height: 4rem;
                text-align: center;
            }
        }
    }

    .spin {
        animation: spin 2s linear infinite;
    }

    .comment-img {
        margin-right: 2rem;
    }

    @keyframes spin {
        from {transform:rotate(0deg);}
        to {transform:rotate(360deg);}
    }

    @media screen and (max-width: 1060px) {
        .video-container {
            flex-direction: column-reverse;
            height: auto;

            .video-options {
                width: 92% !important;
                margin: 2rem auto 0;
            }

            .video-js {
                width: 100% !important;
                height: 52vh !important;
            }
        }

        .comment-form {
            margin: 2rem 0 !important;
            width: 100% !important;
        }

        .comment-img {
            margin-right: 0;
        }
    }

     @media screen and (max-device-width: 560px) {
         .video-container {
             .video-js {
                 height: 42vh !important;
             }

             .video-options {
                width: 100% !important;
            }
         }

         .container {
            .comment-section {
                padding: 2rem 1rem !important;
            }

            .leave-comment-btn {
                margin-left: 0 !important;
                width: 100% !important;
            }
         }

         .comment-form {
             text-align: center;

            .comment-img {
                margin: 0 auto;
            }

            .save-comment-btn {
                display: block;
                width: 100%;
            }
         }
     }

    @media screen and (orientation:landscape)
    and (max-device-width: 560px) {
        .video-container {
             .video-js {
                 height: 80vh !important;
             }
        }
    }

    
</style>