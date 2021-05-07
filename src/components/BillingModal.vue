<template>
  <div>
    <v-dialog v-model="dialog" width="640" class="custom-dialog">

      <v-card class="dialog-container" v-if="home">
        <div class="mb-4">
          <h4>{{ home.name }} Billing</h4>
        </div>

        <div class="content">
            <h6 class="mb-0">Details</h6>
            <v-form ref="form" class="billing-form">
                <v-row>
                    <v-col>
                        <v-text-field v-model="billingForm.streamsPerMonth" type="number" label="Streams Per Month" :rules="[v => !!v || 'Required']"></v-text-field>
                    </v-col>
                    <v-col>
                        <v-text-field v-model="billingForm.maxViewers" type="number" autocomplete="false" label="Max Viewers" :rules="[v => !!v || 'Required']"></v-text-field>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col>
                        <v-text-field v-model="billingForm.maxStreamLength" autocomplete="false" hint="in minutes" label="Max Stream Length" :rules="[v => !!v || 'Required']"></v-text-field>
                    </v-col>
                    <v-col>
                        <v-menu
                            v-model="menu2"
                            :close-on-content-click="false"
                            :nudge-right="40"
                            transition="scale-transition"
                            offset-y
                            min-width="290px"
                            >
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                    :disabled="hasSubStartDate"
                                    v-model="billingForm.subscriptionStartDate"
                                    label="Subscription Start Date"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                    :rules="[v => !!v || 'Required']"
                                ></v-text-field>
                            </template>
                            <v-date-picker
                                v-model="billingForm.subscriptionStartDate"
                                @input="menu2 = false"
                            ></v-date-picker>
                        </v-menu>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col>
                        <vuetify-money v-model="billingForm.costPerAdditionalStream" label="Cost Per Additional Stream" :options="currencyOptions" :rules="[v => !!v || 'Required']"></vuetify-money>
                    </v-col>
                    <v-col>
                        <vuetify-money v-model="billingForm.costPer100Viewers" label="Cost Per 100 Viewers" :options="currencyOptions" :rules="[v => !!v || 'Required']"></vuetify-money>
                        <!-- <v-text-field v-model="billingForm.costPer100Viewers" label="Cost Per 100 Viewers" :rules="[v => !!v || 'Required']"></v-text-field> -->
                    </v-col>
                </v-row>

                <v-row>
                    <v-col>
                        <vuetify-money v-model="billingForm.costPerFifteenMinute" label="Cost Per Fifteen Minute" :options="currencyOptions" :rules="[v => !!v || 'Required']"></vuetify-money>
                    </v-col>
                     <v-col>
                        <vuetify-money v-model="billingForm.subscriptionCost" label="Subscription Cost" :options="currencyOptions" :rules="[v => !!v || 'Required']"></vuetify-money>
                    </v-col>
                </v-row>

                <div class="mt-4 mb-4">
                    <v-btn @click="openBillingPortal()">Update Payment and Billing Address</v-btn>
                    <!-- <h6 class="mb-0">Credit Card</h6>
                    <p v-if="cardOnFile">Current card ends with <strong>4141</strong> <span @click="showCardForm = true" class="text-primary">update</span></p> -->
                </div>

                <!-- <card v-show="showCardForm" class='stripe-card'
                    :class='{ complete }'
                    :stripe="stripe"
                    :options='options'
                    @change='cardInputChange'
                    />
                <small class="text-danger">{{ errorMessage }}</small> -->

                <!-- <v-checkbox v-model="billingForm.billedAnnually" label="Billed Annually"></v-checkbox> -->
                <a href="https://www.notion.so/memoryshare/Adding-an-annual-plan-3d50ad830e4748dd96feca21985e55ca" target="_blank">Bill Annually</a>
            </v-form>

            <div class="mt-2">
                <v-btn  block color="primary" @click="save">Save</v-btn>
                <v-btn class="mt-2 mb-4" block text @click="dialog = false">cancel</v-btn>
            </div>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { Card, createToken } from 'vue-stripe-elements-plus';

export default {
    props: ['token'],
    data() {
        return {
            dialog: false,
            home: null,
            stripe: process.env.VUE_APP_STRIPE_KEY,
            complete: false,
            errorMessage: '',
            showCardForm: true,
            cardOnFile: false,
            currency: "$",
            hasSubStartDate: false,
            billingForm: {
                streamsPerMonth: null,
                costPerAdditionalStream: null,
                maxStreamLength: null,
                costPerFifteenMinute: null,
                maxViewers: null,
                costPer100Viewers: null,
                billedAnnually: false,
                subscriptionCost: null,
                subscriptionStartDate: null,
                stripePaymentToken: null
            },
            currencyOptions: {
                locale: "en-us",
                prefix: "$",
                suffix: "",
                length: 8,
                precision: 2
            },
            options: {
                // see https://stripe.com/docs/stripe.js#element-options for details
            },
            date: new Date(),
            menu: false,
            modal: false,
            menu2: false,
        }
    },
    methods: {
        openDialog() {
            this.dialog = true;
            this.getBilling();
            this.getBillingPortal();
        },
        getBilling() {
            this.axios
                .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                .get(process.env.VUE_APP_API + `/funeralhomes/billing/${ this.home.id }`)
                .then(response => {
                    console.log(response)
                    if (response.data.subscriptionStartDate === '0001-01-01T00:00:00') {
                        response.data.subscriptionStartDate = null;
                        this.hasSubStartDate = false;
                    } else {
                        response.data.subscriptionStartDate = this.$moment(response.data.subscriptionStartDate).format('l')
                        this.hasSubStartDate = true;
                    }
                    
                    this.billingForm = response.data;
                    this.billingForm.costPerAdditionalStream = (response.data.costPerAdditionalStream / 100)
                    this.billingForm.costPer100Viewers = (response.data.costPer100Viewers / 100)
                    this.billingForm.costPerFifteenMinute = (response.data.costPerFifteenMinute / 100)
                    this.billingForm.subscriptionCost = (response.data.subscriptionCost / 100)
                })
                .catch(error => {
                    console.log(error)
                })
        },
        getBillingPortal() {
            this.axios
                .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                .get(process.env.VUE_APP_API + `/funeralhomes/billing/portal/${ this.home.id }`)
                .then(response => {
                    console.log(response)
                })
                .catch(error => {
                    console.log(error)
                })
        },
        formatAsCurrency (value, dec) {
            dec = dec || 0
            if (value === null) {
                return 0
            }
            return '' + value.toFixed(dec).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
        },
        validate() {
            let stripeValid = false;
            let formValid = this.$refs.form.validate();
            this.errorMessage = '';

            // createToken()
            //     .then(data => {
            //         console.log(data)
            //         if (data.error) {
            //             this.errorMessage = data.error.message;
            //             return;
            //         } 
            //         this.billingForm.stripePaymentToken = data.token.id;
            //         stripeValid = true;
            //     })
            //     .catch(error => {
            //         console.log(error)
            //     }).then(() => {
            //         if (stripeValid && formValid) this.save();
            //     })

            //if (formValid) this.save();
        },
         openBillingPortal() {
            this.axios
                .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                .get(process.env.VUE_APP_API + `/funeralhomes/billing/portal/${ this.home.id }`)
                .then(response => {
                    console.log(response.data)
                    window.open(response.data, '_blank')
                })
                .catch(error => {
                    console.log(error)
                })        
        },
        save() {
            let formValid = this.$refs.form.validate();
            if (!formValid) return;

            let data = {
                funeralHomeId: this.home.id,
                streamsPerMonth: +this.billingForm.streamsPerMonth,
                costPerAdditionalStream: +this.billingForm.costPerAdditionalStream.toString().includes('.') ? +this.billingForm.costPerAdditionalStream.toString().replace('.', '') : (this.billingForm.costPerAdditionalStream * 100),
                maxStreamLength: +this.billingForm.maxStreamLength,
                costPerFifteenMinute: +this.billingForm.costPerFifteenMinute.toString().includes('.')? this.billingForm.costPerFifteenMinute.replace('.', '') : (this.billingForm.costPerFifteenMinute * 100),
                maxViewers: +this.billingForm.maxViewers,
                costPer100Viewers: +this.billingForm.costPer100Viewers.toString().includes('.') ? this.billingForm.costPer100Viewers.replace('.', '') : (this.billingForm.costPer100Viewers * 100),
                billedAnnually: false,
                subscriptionCost: +this.billingForm.subscriptionCost.toString().includes('.') ? this.billingForm.subscriptionCost.replace('.', '') : (this.billingForm.subscriptionCost * 100),
                subscriptionStartDate: new Date(this.billingForm.subscriptionStartDate).toISOString(),
                // stripePaymentToken: this.billingForm.stripePaymentToken
            }

            this.axios
                .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                .post(process.env.VUE_APP_API + '/funeralhomes/billing', data)
                .then(response => {
                    console.log(response)
                    this.dialog = false;
                    this.$emit('message', 'Home updated')
                })
                .catch(error => {
                    console.log(error)
                    this.$emit('message', error.response.data)
                })
        },
        cardInputChange() {
            if (this.errorMessage.length) this.errorMessage = '';
        }
    },
    components: {
        Card,
    }
}
</script>

<style lang="scss" scoped>
    .billing-form {
        margin-top: -1rem;
    }

    .stripe-card {
         background: #fafafa;
         padding: 1rem;
    }
</style>