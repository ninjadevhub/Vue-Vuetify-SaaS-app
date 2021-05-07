<template>
    <div>
        <div v-if="loading" class="text-center mt-5 mb-5">
            gettings data
        </div>

        <div v-else>
            <div v-if="healthRecords.length">
                <v-autocomplete v-model="selectedRecord" @change="getHealthChart" :items="healthRecords" label="Select a streaming session">
                    <template v-slot:selection="{ item }">
                        {{ item.started_at | moment('lll') }}
                    </template>
                    <template v-slot:item="{ item }">
                        {{ item.started_at | moment('lll') }}
                    </template>
                </v-autocomplete>

                <div v-if="chartReady">
                    <line-chart :chart-data="datacollection" :options="options"></line-chart> 
                </div>
            </div>
            
            <div v-else>
                no records
            </div>
        </div>
    </div>
</template>

<script>
import LineChart from '../components/charts/LineChart';

export default {
    props: ['live', 'token'],
    data() {
        return {
            event: {},
            healthRecords: [],
            selectedRecord: {},
            datacollection: null,
            chartReady: false,
            loading: false,
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
            options: {
                responsive: true,
                maintainAspectRatio: false,
            }
        }
    },
    methods: {
        init() {
            this.loading = true;
            this.getHealthRecords();
        },
        getHealthRecords() {
            this.axios
                .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                .get(process.env.VUE_APP_API + `/live/get-health-records/${ this.event.liveStreamId }`)
                .then(response => {
                    console.log('records')
                    console.log(response.data.uptimes)
                    this.healthRecords = response.data.uptimes;

                    if (this.live) {
                        console.log(this.healthRecords[this.healthRecords.length - 1])
                        this.selectedRecord = this.healthRecords[this.healthRecords.length - 1];
                        this.getHealthChart();
                    }
                })
                .catch(error => {
                    console.log(error)
                })
                .then(() => {
                    this.loading = false;
                })
        },
        getHealthChart(item) {
            this.labels = [];
            this.inboundData.data = [];
            this.outboundData.data = [];
            this.framerateData.data = [];
            this.keyframeData.data = [];

            this.axios
                .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                .get(process.env.VUE_APP_API + `/live/get-health-chart/${ this.event.liveStreamId  }?uptimeRecordId=${ this.selectedRecord.id }`)
                .then(response => {
                    console.log(response)

                    response.data.history.forEach(item => {
                        if (item.created_at) this.labels.push(this.$moment(item.created_at).format('LT'))
                        if (item.bits_in_rate) this.inboundData.data.push(item.bits_in_rate.value)
                        if (item.bits_out_rate) this.outboundData.data.push(item.bits_out_rate.value)
                        if (item.frame_rate) this.framerateData.data.push(item.frame_rate.value)
                        if (item.keyframe_interval) this.keyframeData.data.push(item.keyframe_interval.value)
                    })

                    this.datacollection = {
                        labels: this.labels,
                        datasets: [
                            this.inboundData,
                            this.outboundData,
                            this.framerateData,
                            this.keyframeData
                        ]
                    }

                    this.chartReady = true;
                })
        },
        getLiveChart() {
            this.axios
                .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                .get(process.env.VUE_APP_API + `/live/get-live-health-chart/${ this.event.liveStreamId  }`)
                .then(response => {
                    
                    console.log(response);    
                    console.log(response.data.current);  
                    
                    this.inboundData.data.push(response.data.current.bits_in_rate.value)

                     response.data.current.forEach(item => {
                        if (item.created_at) this.labels.push(this.$moment(item.created_at).format('LT'))
                        if (item.bits_in_rate) this.inboundData.data.push(item.bits_in_rate.value)
                        if (item.bits_out_rate) this.outboundData.data.push(item.bits_out_rate.value)
                        if (item.frame_rate) this.framerateData.data.push(item.frame_rate.value)
                        if (item.keyframe_interval) this.keyframeData.data.push(item.keyframe_interval.value)
                    })

                    this.datacollection = {
                        labels: this.labels,
                        datasets: [
                            this.inboundData,
                            this.outboundData,
                            this.framerateData,
                            this.keyframeData
                        ]
                    }
                    
                })
        }
    },
    components: {
        LineChart
    }
}
</script>

<style lang="scss" scoped>
</style>