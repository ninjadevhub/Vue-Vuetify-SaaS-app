<template>
    <div class="chart elevation-3 pb-2">
        <h5 class="chart-title weekly">{{ titles[title] }} Views</h5>

        <div class="chart-container">
            <line-chart :chart-data="datacollection" :options="options"></line-chart> 

            <div class="mt-4 text-center">
                <h6 class="d-inline-block mr-5" style="border-bottom: 1px solid rgba(255,83,13,.7)">All Views <span>{{ allViews.data.length }}</span></h6>
                <h6 class="d-inline-block mr-5" style="border-bottom: 1px solid rgba(25,83,13,.7)">Delayed Views <span>{{ delayedViews.data.length }}</span></h6>
                <h6 class="d-inline-block" style="border-bottom: 1px solid rgba(25,200,13,.7)">Live Views <span>{{ liveViews.data.length }}</span></h6>
                <!-- <span style="">{{ response.totalDelayed }}</span>
                <span style=""></span> -->
            </div>
        </div>
    </div>
</template>

<script>
import LineChart from './LineChart';
const moment = require('moment');

export default {
    props: ['title'],
    data () {
        return {
            titles: ['Weekly', 'Monthly', 'Yearly'],
            data: {},
            labels: [],
            datacollection: null,
            options: {
                responsive: true,
                maintainAspectRatio: false,
            },
            allViews: {
                label: 'All',
                borderColor: "rgba(255,83,13,.7)",
                backgroundColor: 'rgba(200,200,200,0)',
                data: []
            },
            delayedViews: {
                label: 'Delayed',
                borderColor: "rgba(25,83,13,.7)",
                backgroundColor: 'rgba(200,200,200,0)',
                data: []
            },
            liveViews: {
                label: 'Live',
                borderColor: "rgba(25,200,13,.7)",
                backgroundColor: 'rgba(200,200,200,0)',
                data: []
            }
        }
    },
    methods: {
        init() {
            this.labels = [];
            this.allViews.data = [];
            this.delayedViews.data = [];
            this.liveViews.data = [];

            let arr = this.data.views.reverse()
            arr.forEach(item => {
                if (item.viewDate) this.labels.push(this.$moment(item.viewDate).format('l'))
                if (item.allViews) this.allViews.data.push(item.allViews)
                if (item.delayedViews) this.delayedViews.data.push(item.delayedViews)
                if (item.liveViews) this.liveViews.data.push(item.liveViews)
            })


            this.datacollection = {
                labels: this.labels,
                datasets: [
                    this.allViews,
                    this.delayedViews,
                    this.liveViews
                ]
            }
        },
    },
    components: {
        LineChart
    }
}
</script>

<style lang="scss" scoped>
    
</style>