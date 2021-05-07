<template>
    <div class="chart elevation-3">
        <h5 class="chart-title yearly">Yearly Views</h5>

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
            labels: ['2018', '2019', '2020'],
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
        init() {
            this.datacollection = {
                labels: this.labels,
                datasets: [
                    {   borderColor: "rgba(171,6,88, .7)",
                        backgroundColor: 'rgba(200,200,200,.2)',
                        data: [303, 400, 234]
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