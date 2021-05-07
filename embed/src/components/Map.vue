<template>
    <l-map ref="map" @ready="doSomethingOnReady()" style="height: 24rem" :zoom="zoom" :center="center" :options="mapOptions">
        <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
        
        <v-marker-cluster :options="clusterOptions" ref="clusterRef">
            <l-marker v-for="(marker, index) in commentMarkers" :key="'c-' + index" @click="handleSelectedComment(index)" :lat-lng="marker" :icon="commentsIcon(index)">
                <l-popup>
                <div>
                    <div>
                        <div>
                            <img ref="pinImage" class="comment-thumbnail">
                            
                            <div class="ml-2 d-inline-block" style="vertical-align: top">
                                <h5 class="mb-0" style="font-size: .9rem">{{ commentPins[index].name }}</h5>
                                <small>{{ commentPins[index].createDate | moment('L') }}</small>
                            </div>
                        </div>

                        <p class="mb-0 mt-1">{{ commentPins[index].content }}</p>
                    </div>
                </div>
                </l-popup>
            </l-marker>
        </v-marker-cluster>

        <LeafletHeatmap :lat-lngs="viewersMarkers" :radius="30"></LeafletHeatmap>

        <!-- <l-marker v-for="(marker, index) in viewersMarkers" :key="'v-' + index" :icon="redIcon()" :lat-lng="marker"></l-marker> -->
    </l-map>
</template>

<script>
import Avatar from 'vue-avatar-component';
import LeafletHeatmap from './LeafletHeatmap';

export default {
    props: ['slug'],
    data() {
        return {
            commentPins: [],
            zoom: 4,
            center: [0, 0],
            rotation: 0,
            map: '',
            clusterOptions: {},
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
            mapOptions: {
                zoomSnap: 0.5
            },
            commentMarkers: [],
            viewersMarkers: [],
            selectedComment: {}
        }
    },
    methods: {
        init() {
            this.center = [this.commentPins[0].latitude, this.commentPins[0].longitude]

            this.commentPins.forEach(item => {
                this.commentMarkers.push(L.latLng(item.latitude, item.longitude))
            })

            this.getAnalytics();
            console.log(this.commentPins)
        },
        doSomethingOnReady() {
            this.map = this.$refs.map;
        },
        handleSelectedComment(index) {
            let src = this.commentPins[index].pictureUrl ? this.commentPins[index].pictureUrl : `https://ui-avatars.com/api/?name=${ this.commentPins[index].name.replace(/ /g,"+") }&rounded=true&background=AB0658&color=fff`;
            this.$refs.pinImage[index].src = src;
        },
        getAnalytics() {
            this.axios
                .get(`https://api.memoryshare.com/api/analytics/get/${this.slug}`)
                .then(response => {
                   const result = [...response.data.reduce( (mp, o) => {
                        if (!mp.has(o.city)) mp.set(o.city, { ...o, count: 0 });
                        mp.get(o.city).count++;
                        return mp;
                    }, new Map).values()];

                    result.forEach(item => {
                        this.viewersMarkers.push([item.latitude, item.longitude, (item.count * 10)])
                    })
                })
                .catch(error => {
                    console.log(error)
                })
        },
        commentsIcon(index) {
            if (this.commentPins[index]) {
                return new L.Icon({
                    iconUrl: this.commentPins[index].pictureUrl ? this.commentPins[index].pictureUrl : `https://ui-avatars.com/api/?name=${ this.commentPins[index].name.replace(/ /g,"+") }&rounded=true&background=AB0658&color=fff`,
                    iconSize: [36, 36],
                    iconAnchor: [12, 20],
                    popupAnchor: [1, -34],
                });
            }
        },
        zoomIn() {
            this.zoom = 8;
        }
    },
    components: {
        Avatar,
        LeafletHeatmap
    }
}
</script>

<style lang="scss" scoped>
    @import "~leaflet.markercluster/dist/MarkerCluster.css";
    @import "~leaflet.markercluster/dist/MarkerCluster.Default.css";

    .comment-thumbnail {
        height: 2.5rem;
        width: 2.5rem;
        border-radius: 50%;
        object-fit: cover;
    }

    .marker-cluster img.leaflet-marker-icon {
        border-radius: 50% !important;
    }
</style>