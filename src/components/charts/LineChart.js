import { Line, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins

export default {
  extends: Line,
  mixins: [reactiveProp],
  props: ['chartData', 'options'],
  mounted () {
    // this.chartData is created in the mixin.
    console.log(this.options)
    // If you want to pass options please create a local options object
    this.renderChart(this.chartData, this.options)
  }
}