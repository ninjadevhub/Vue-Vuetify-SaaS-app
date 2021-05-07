<template>
    <div>
        <div class="video-container d-flex">
                <div v-if="!live" class="video-options">
                    <div class="video-header">{{ videoStatus }}</div>
                    <ul>
                        <li v-for="(item, index) in sortedEvents" :class="{ 'active': item.active, 'ready': item.convertedVideo }" :key="item.index" @click="setActiveVideo(index, true, true)">
                            <div class="options-icon d-inline-block">
                                <span class="event-icon">
                                    <!-- not current video play button placeholder -->
                                    <play-icon v-if="!item.active && item.convertedVideo" class="play ease"></play-icon>

                                    <!-- active video icons -->
                                    <play-icon v-if="item.active && videoStatus === 'Paused' && item.convertedVideo" class="play ease"></play-icon>
                                    <pause-icon v-if="item.active && videoStatus === 'Playing' && item.convertedVideo" class="play ease"></pause-icon>
                                    <loader-icon v-if="item.active && (videoStatus === 'Loading' || videoStatus === 'Preparing next video' ) && item.convertedVideo" class="play ease spin"></loader-icon>

                                    <span v-if="item.live" class="live-callout">LIVE</span> 
                                </span>
                            </div>
 
                            <div class="options-content d-inline-block">
                                <small v-if="!item.active && item.convertedVideo && index === (currentVideoIndex + 1)" class="next-in-queue">Next in queue</small>
                                <h6 :class="[{ 'upcoming': !item.convertedVideo }, 'mb-0']">{{ item.title }}</h6> 
                                <small v-if="item.time !== minDate" class="time-callout">{{ item.time | moment("lll") }}</small>
                                <small v-else class="time-callout">awaiting time</small>
                            </div>
                        </li>
                    </ul>

                    <div v-if="upcomingEvents.length" class="text-left">
                        <h5 class="text-light upcoming-callout">Upcoming</h5>
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
                <video ref="videoPlayer" class="video-js vjs-big-play-centered" />
            </div>
    </div>
</template>

<script>
import videojs from 'video.js';
import videoJsShare from 'videojs-share';
import 'videojs-flash';
import 'videojs-markers';
//import 'videojs-contrib-hls';
require('@silvermine/videojs-chromecast')(videojs, { preloadWebComponents: true });
import 'video.js/dist/video-js.min.css';
import 'videojs-share/dist/videojs-share.css'
import 'videojs-markers/dist/videojs.markers.min.css'
import { PlayIcon, PauseIcon, ClockIcon, LoaderIcon } from 'vue-feather-icons'

export default {
    name: "VideoPlayer",
    data() {
        return {
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
            upcomingEvents: []
        }
    },
    props: ['srcArr', 'events', 'ready'],
    beforeDestroy() {
        if (this.player) {
            this.player.dispose()
        }
    },
    methods: {
        jumpToTime(time) {
            this.player.currentTime(time);
        },
        createMarkersObject() {
            let arr = [];
            this.items.forEach(item => {
                arr.push({ time: item.start, text: item.name })
            })
            return arr;
        },
        setVideoList(){
            let now = new Date();
            this.events.forEach(item => {
                //console.log(item.time)
                if (item.time > this.minDate && item.time < now.toISOString()) {
                    // add to sorted events
                    this.sortedEvents.push(item);
                } else {
                    // add to upcoming events
                    this.upcomingEvents.push(item)
                }

                this.videoLength = this.sortedEvents.length;
                this.sortedEvents = this.sortedEvents.slice().sort(function(a, b) {
                    return (a===null)+(b===null) || -(new Date(a.time).getTime()<new Date(b.time).getTime())||+(new Date(a.time).getTime()>new Date(b.time).getTime());
                });

                this.upcomingEvents = this.upcomingEvents.slice().sort(function(a, b) {
                return (a===null)-(b===null) || -(new Date(a.time).getTime()>new Date(b.time).getTime())||+(new Date(a.time).getTime()<new Date(b.time).getTime());
            });
            })
        },
        initVideoJs(videos) {
            let _ = this;
            this.setVideoList();
        // let castScript = document.createElement('script')
        // castScript.setAttribute('src', 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1')
        // document.head.appendChild(castScript)

        // let castStyle = document.createElement('link')
        // castStyle.setAttribute('href', 'https://cdn.jsdelivr.net/npm/@silvermine/videojs-chromecast@1.1.2/dist/silvermine-videojs-chromecast.css')
        // document.head.appendChild(castStyle)

            this.options = {
                autoplay: false,
                controls: true,
                techOrder: ['chromecast', 'html5'],
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
                console.log('onPlayerReady', this);

                if (_.srcArr.length) {
                    _.setActiveVideo(0, false)
                }

                let img = this.controlBar.addChild('Component', {}, 12)
                img.addClass("video-logo");
            })

            //this.player.chromecast({ addButtonToControlBar: true })
            this.player.share(shareOptions);

            // set video markers
            // this.player.markers({
            //     markerTip:{
            //         display: true,
            //         text: function(marker) {
            //             return marker.text;
            //         },
            //         time: function(marker) {
            //             return marker.time;
            //         }
            //     },
            //     markers: this.createMarkersObject()
            // });

            this.player.on('timeupdate', (time) => {
                this.videoStatus = this.player.paused() ? 'Paused' : 'Playing';

                // update dynamic scrubber
                // this.items.forEach(item => {
                //     if (+item.start < this.player.currentTime() && +item.end > this.player.currentTime()) {
                //         item.active = true
                //     } else {
                //         item.active = false
                //     }
                // })
            })

            this.player.on('ended', () => {
                _.currentVideoIndex = _.sortedEvents.findIndex(item => item.active === true);

                if (currentIndex < (_.videoLength - 1)) {
                    _.videoStatus = "Preparing next video"
                    _.currentVideoIndex++;
                    _.setActiveVideo(_.currentVideoIndex)
                }
            })

            this.player.on('waiting', () => {
                _.videoStatus = 'Loading'
            })

        },
        setLiveVideo() {

        },
        setActiveVideo(index, autoStart = true, listItemClickEvent = false) {
            console.log(index)
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
            this.sortedEvents[index].active = true;  

            this.player.src({ type: 'video/mp4', src: this.sortedEvents[index].convertedVideo})
            if (autoStart) this.player.play();   
        },
    },
    components: {
        PlayIcon,
        PauseIcon,
        ClockIcon,
        LoaderIcon
    }
}
</script>

<style lang="scss" scoped>
    .video-js {
        margin: 0 auto;
        position: relative !important;
        width: 74vw !important;
        height: 72vh !important;

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
    }

    .video-options {
        width: 20vw !important;
        margin-right: 2.5vw;
        overflow-y: auto;
        
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
            transition: .3s ease-in-out;

            &.ready:hover {
                cursor: pointer;
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
        opacity: .7;
    }

    .upcoming {
        opacity: .5;
    }

    .upcoming-callout {
        margin: 2rem 0 0;
        border-bottom: 1px solid #888;
        // display: inline-block;
        padding: .5rem 1rem;
        opacity: .7;
    }

    .next-in-queue {
        opacity: .5;
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