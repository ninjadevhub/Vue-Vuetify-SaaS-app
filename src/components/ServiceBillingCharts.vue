<template>
    <div class="mt-8">
    <v-row v-if="this.minutesSection[0].value > 0 || this.viewersSection[0].value > 0" class="billing-container">
        <v-col class="billing-tile">
            <vc-donut :sections="minutesSection" has-legend :auto-adjust-text-size="true">Streaming Minutes</vc-donut>
        </v-col>
        <v-col class="billing-tile">
            <vc-donut :sections="viewersSection" has-legend :auto-adjust-text-size="true">Viewers</vc-donut>
        </v-col>
    </v-row>

    <v-btn v-if="this.minutesSection[0].value > 0 || this.viewersSection[0].value > 0"  @click="goToBillingEvents" class="billing-btn">Go To Billing</v-btn>
    </div>
</template>

<script>
export default {
    props: ['id'],
    data() {
        return {
            minutesSection: [
                { label: 'Minutes Used', value: 0, color: '#FF530D' },
            ],
            viewersSection: [
                { label: 'Total Viewers', value: 0, color: '#0c3c60' },
            ]
        }
    },
    methods: {
        init(token) {
            this.axios
                .create({ headers: {'Authorization': `Bearer ${token}`} })
                .get(process.env.VUE_APP_API + `/services/billing?serviceId=${ +this.$route.params.id }`)
                .then(response => {
                    let minutes = (response.data.usedMinutes / response.data.allowedMinutes) * 100;
                    let views = (response.data.usedViewers / response.data.allowedViewers) * 100;

                    this.minutesSection[0].label = `${ response.data.usedMinutes }/${ response.data.allowedMinutes } Minutes Used`;
                    this.viewersSection[0].label = `${ response.data.usedViewers }/${ response.data.allowedViewers } Views`

                    if (minutes < 100) {
                        this.minutesSection[0].value = minutes
                    } else {
                        this.minutesSection[0].value = 100;
                        this.minutesSection[0].color = '#e73538';
                    }

                    if (views < 100) {
                         this.viewersSection[0].value = views
                    } else {
                         this.viewersSection[0].value = 100
                         this.viewersSection[0].color = '#e73538';
                    }
                })
                .catch(error => {
                    console.log(error)
                })
        },
        goToBillingEvents() {
            this.$router.push({ path: `/manage-services/billing/${ this.$route.params.id }` })
        },
    }
}
</script>

<style lang="scss" scoped>
    .billing-container {
        width: 64vw;
        margin: auto;
        text-align: center;

        .billing-tile {
            position: relative;
            z-index: 1;
            background: #fff;
            box-shadow: 0 0 .5rem #666;
            padding: 2rem 0;

            &:first-of-type {
                margin-right: 1rem;
            }

             &:nth-child(2) {
                margin-left: 1rem;
            }
            
        }
    }

    .billing-btn {
        margin: 2rem 0 2rem 14%;
    }
</style>