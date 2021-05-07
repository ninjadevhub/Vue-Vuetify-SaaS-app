<template>
    <div>
        <side-nav></side-nav>
        <div v-bind:class="[{ 'menu-showing': this.$store.state.menuShowing }, 'dash-container']">
            <div class="tile">
                <v-card-title>
                    <h4>Billing Events</h4>
                    <v-spacer></v-spacer>
                    <v-btn @click="$router.go(-1)">back</v-btn>
                </v-card-title>
                <v-data-table
                    :headers="headers"
                    :items="billingEvents"
                    :loading="loading"
                    loading-text="Getting Billing Events...">

                    <template v-slot:item.date="{ item }">  
                        <span>{{ item.reportedDate | moment('l') }}</span>
                    </template> 

                    <template v-slot:item.event="{ item }">  
                        <v-chip>{{ eventTypes[item.eventType] }}</v-chip>
                    </template> 

                    <template v-slot:item.amount="{ item }">  
                        <span>${{ item.amount.toFixed(2) }}</span>
                    </template> 
                </v-data-table>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    metaInfo: {
      title: 'Billing',
    },
    data() {
        return {
            token: '',
            billingEvents: [],
            eventTypes: ['Streaming Overage', 'Viewer Overage', 'Service Overage'],
            loading: false,
            headers: [
                { text: 'Date', value: 'date' },
                { text: 'Events', value: 'event' },
                { text: 'Amount', value: 'amount', width: '15%' },
                { text: 'Description', value: 'description' },
            ]
        }
    },
    mounted() {
        this.getBillingEvents();
    },
    methods: {
        getBillingEvents() {
            this.$auth.getIdTokenClaims().then(result => {
                this.token = result.__raw;

                this.axios
                    .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                    .get(process.env.VUE_APP_API + `/billing/events/${ +this.$route.params.id }`)
                    .then(response => {
                        console.log(response)
                        this.billingEvents = response.data;
                    })
                    .catch(error => {
                        console.log(error)
                    })
                    .then(() => {
                        this.loading = false;
                    })
            });
        },
    }
}
</script>

<style lang="scss" scoped>
    .dash-container {
        background: url('https://d1pnnwteuly8z3.cloudfront.net/images/1fde3b9d-4dc8-422c-8e23-bbe443fd0870/3db295f3-24bb-4347-8d2e-c58abfeb92aa.svg') no-repeat 0 -18rem;
    }
</style>