<template>
    <div>
        <side-nav></side-nav>
        <div v-bind:class="[{ 'menu-showing': this.$store.state.menuShowing }, 'dash-container']">

            <v-container>
                <v-card-title>
                    <h3 class="text-light d-inline-block title-block">
                        <bar-chart-icon size="1.25x"></bar-chart-icon>
                        {{ viewingService && service ? `Analytics for ${ service.firstName + ' ' + service.lastName }` : 'Analytics' }}
                     </h3>
                </v-card-title>

                <v-row>
                    <v-col cols="12" sm="6" md="8">
                          <AnalyticsChart ref="analyticsChart" :title="viewTab" /> 

                          <div class="mt-4">
                            <v-btn @click="viewTab = 0" rounded :class="[{ 'active': viewTab === 0 }, 'mr-4']">This Week</v-btn>
                            <v-btn @click="viewTab = 1" rounded :class="[{ 'active': viewTab === 1 }, 'mr-4']">Monthly</v-btn>
                            <v-btn @click="viewTab = 2" rounded :class="{ 'active': viewTab === 2 }">Yearly</v-btn>
                          </div>
                    </v-col>

                    <v-col cols="6" md="4">
                        <v-card class="card-padding">
                            <v-card-text>
                                <div class="view-callout">
                                  <h4>{{ response.total }}</h4>
                                  <h5 style="color: rgba(255,83,13,.7)">All Views</h5>
                                </div>

                                <div class="view-callout">
                                  <h5>{{ response.totalDelayed }}</h5>
                                  <p>Delayed Views</p>
                                </div>

                                <div class="view-callout">
                                  <h5>{{ response.totalLive }}</h5>
                                  <p>Live Views</p>
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
                
                <v-row>
                   
                </v-row>
            </v-container>

            <v-snackbar v-model="snackbar" :timeout="3000">
              {{ message }}
          </v-snackbar>
        </div>
    </div>
</template>

<script>
import { BarChartIcon } from 'vue-feather-icons';
import AnalyticsChart from '../components/charts/AnalyticsChart';
import MonthChart from '../components/charts/MonthChart';
import YearChart from '../components/charts/YearChart';

export default {
  metaInfo: {
      title: 'Analytics',
    },
  data() {
    return {
      viewTab: 0,
      viewingService: false,
      token: '',
      snackbar: false,
      message: '',
      loading: false,
      service: undefined,
      response: {},
    }
  },
  mounted() {
    this.$auth.getIdTokenClaims().then(result => {
      this.token = result.__raw;

      if (+this.$route.params.id) {
          this.viewingService = true;
          this.getService(+this.$route.params.id)
          this.getAnalytics('week')
      } else {
        this.getAnalytics('week')
      }
    });
  },
  watch: {
    'viewTab': {
      handler: function() {
    
        if (this.viewTab === 0 && this.token.length) {
          this.getAnalytics('week')
        }

        if (this.viewTab === 1) {
          this.getAnalytics('month')
        }

        if (this.viewTab === 2) {
          this.getAnalytics('year')
        }
      },
      immediate: true,
    }
  },
  methods: {
    getService(id) {
      this.axios
          .create({ headers: {'Authorization': `Bearer ${this.token}`} })
          .get(process.env.VUE_APP_API + `/Services/${id}`)
          .then(response => {
              console.log('service')
              console.log(response.data)
              this.service = response.data;
          })
          .catch(error => {
              console.log(error)
              console.log(error.response)
              this.message = `Error! Unable to find service with id ${id}`
              this.snackbar = true;
          }).then(() => {
              this.loading = false;
          })
    },
    getAnalytics(frame) {
      let query = '';
      if (this.$route.params.id) {
        query = `${ frame }?serviceId=${ +this.$route.params.id }`
      } else {
        query = `${ frame }`
      }

      this.axios
        .create({ headers: {'Authorization': `Bearer ${this.token}`} })
        .get(process.env.VUE_APP_API + `/dogs/get/views/line-chart/${ query }`)
        .then(response => {
          console.log(response.data)
          this.response = response.data;
          this.$refs.analyticsChart.data = response.data;
          this.$refs.analyticsChart.init();
        })
        .catch(error => {
          console.log(error)
        })
    }
  },
  components: {
      BarChartIcon,
      AnalyticsChart,
      MonthChart,
      YearChart
  }
}
</script>

<style lang="scss" scoped>
    .dash-container {
        background: url('https://d1pnnwteuly8z3.cloudfront.net/images/1fde3b9d-4dc8-422c-8e23-bbe443fd0870/f93c8bac-6f36-4379-a2a3-ef312021d719.svg') no-repeat 0 -18rem;
    }

    .title-block {
      text-shadow: 1px 1px #666;
    }

    .card-padding {
        padding: 2rem 1rem;
        margin-top: 0;
    }

    .view-callout {
      margin-bottom: 3rem;
    }

    .active {
      background: #272727 !important;
      color: #fff !important;
    }
</style>