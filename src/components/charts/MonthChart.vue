<template>
    <div class="chart elevation-3">
        <h5 class="chart-title">Monthly Views</h5>

        <div class="chart-container">
            <line-chart :chart-data="datacollection" :options="options"></line-chart> 
        </div>
    </div>
</template>

<script>
import LineChart from './LineChart';
const moment = require('moment');

export default {
    data () {
        return {
            labels: ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            datacollection: null,
            options: {
                scales: {
                    yAxes: [
                        {
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    },
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                    display: false
                },
            }
        }
    },
    methods: {
        init () {
            this.datacollection = {
                labels: this.labels,
                datasets: [
                    {   borderColor: "rgba(224,0,0, .7)",
                        backgroundColor: 'rgba(200,200,200,.2)',
                        data: [100, 130, 80, 72, 120, 101, 70, 97, 108, 98, 99, 114]
                    }, 
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