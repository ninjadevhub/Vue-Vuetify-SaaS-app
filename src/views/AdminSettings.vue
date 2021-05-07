<template>
    <div>
        <side-nav></side-nav>
        <div v-bind:class="[{ 'menu-showing': this.$store.state.menuShowing }, 'dash-container']">
            <div class="tile elevation-6">
                <div class="header">
                    <h4><settings-icon size="1x" class="mr-4"></settings-icon>Admin Settings</h4>
                    <v-spacer></v-spacer>
                    <v-btn @click="$router.go(-1)">back</v-btn>
                </div>

                <div>
                    <v-tabs v-model="tab" color="#0d5259">
                        <v-tab href="#details">Details</v-tab>
                        <v-tab href="#settings">Settings</v-tab>
                        <v-tab :disabled="isDevHome" href="#billing">Billing</v-tab>
                        <v-tab href="#profitability">Profitability</v-tab>
                    </v-tabs>

                    <v-tabs-items :value="tab">
                        <v-tab-item value="details">
                            <div class="tab-padding">
                                <v-form class="form-container" ref="form" lazy-validation>
                                    <v-text-field v-model="detailsForm.name" :rules="[v => !!v || 'Name is required']" label="Funeral Home Name" required></v-text-field>
                                    <v-text-field v-model="detailsForm.address1" label="Address 1" required></v-text-field>
                                    <v-text-field v-model="detailsForm.address2" label="Address 2" required></v-text-field>

                                    <v-row class="mt-0">
                                        <v-col>
                                            <v-text-field v-model="detailsForm.city" label="City" required></v-text-field>
                                        </v-col>
                                        
                                        <v-col>
                                            <v-text-field v-model="detailsForm.state" label="State" required></v-text-field>
                                        </v-col>

                                        <v-col>
                                            <v-text-field v-model="detailsForm.zipCode" label="Zip" required></v-text-field>
                                        </v-col>
                                    </v-row>

                                    <v-text-field v-model="detailsForm.email" :rules="[v => !!v || 'Email is required']" label="Email" type="email" required></v-text-field>

                                    <v-select v-model="detailsForm.ownerId" :items="OwnerIdList" item-text="text" item-value="val" label="Owner Id"></v-select>

                                    <v-text-field v-model="detailsForm.primaryContact" :rules="[v => !!v || 'Primary Contact is required']" label="Primary Contact Name" required></v-text-field>
                                    
                                    <v-text-field v-model="detailsForm.primaryContactPhoneNumber" v-mask="'###.###.####'" label="Primary Contact Phone" type="phone" required></v-text-field>

                                    <v-text-field v-model="detailsForm.primaryContactEmail" :rules="[v => !!v || 'Email is required']"  label="Primary Contact Email" type="email" required></v-text-field>
                                    
                                    <v-text-field v-model="detailsForm.funeralHomeNumber" v-mask="'###.###.####'" :rules="[v => !!v || 'Funeral Home Number is required']" type="phone" label="Funeral Home Number" required></v-text-field>

                                    <v-checkbox v-model="detailsForm.devHome" label="*Dev Home (Will be ignored from analytics, and billing)"></v-checkbox>

                                    <div class="text-right mt-10 mb-6">                        
                                        <v-btn @click.prevent="saveHome()" :loading="busy" :disabled="busy" color="primary">Save Home</v-btn>
                                    </div>

                                </v-form>
                            </div>
                        </v-tab-item>

                        <v-tab-item value="settings">
                            <div class="tab-padding">
                                <home-settings modal="false" :id="$route.params.id" :token="token" ref="homeSettings" @message="setSnackBar" />
                            </div>
                        </v-tab-item>

                        <v-tab-item value="billing">
                            <div class="tab-padding">
                                <div class="d-flex">
                                    <div class="flex-2">
                                        <v-alert @click="openBillingPortal()" v-if="!billingForm.hasDefaultPaymentMethod && !loading" border="top" color="red lighten-2" dark>
                                            * No credit card on file. Please update to edit the billing information.
                                        </v-alert>
                                        <v-btn v-if="stripeId" @click="goToStripeDashboard()" color="primary" class="mr-4">View Stripe Dashboard</v-btn>
                                        <v-btn @click="openBillingPortal()">Update Payment and Billing Address</v-btn>
                                    </div>

                                    <div class="flex-1 text-right">
                                         <p class="mb-0">
                                            Subscription Status 
                                        
                                            <v-chip v-if="billingForm.subscriptionStatus === 0" class="ma-2" color="green" text-color="white">
                                                <check-circle-icon size="1x" class="mr-1" />
                                                {{ subscriptionStatus[billingForm.subscriptionStatus] }}  
                                            </v-chip>

                                            <v-chip v-if="billingForm.subscriptionStatus === 1" class="ma-2" color="red" text-color="white">
                                                <x-circle-icon size="1x" class="mr-1" />
                                                {{ subscriptionStatus[billingForm.subscriptionStatus] }}  
                                            </v-chip>
                                        </p>
                                    </div>
                                </div>
                                <!-- <div class="mb-6">
                                    <v-alert @click="openBillingPortal()" v-if="!billingForm.hasDefaultPaymentMethod && !loading" border="top" color="red lighten-2" dark>
                                        * No credit card on file. Please update to edit the billing information.
                                    </v-alert>
                                    <v-btn v-if="stripeId" @click="goToStripeDashboard()" color="primary" class="mr-4">View Stripe Dashboard</v-btn>
                                    <v-btn @click="openBillingPortal()">Update Payment and Billing Address</v-btn>
                                </div> -->

                                <v-form ref="billingForm" class="billing-form">
                                    <v-row>
                                        <v-col>
                                            <v-text-field v-model="billingForm.streamsPerMonth" :disabled="!billingForm.hasDefaultPaymentMethod" type="number" label="Streams Per Month"></v-text-field>
                                        </v-col>
                                        <v-col>
                                            <v-text-field v-model="billingForm.maxViewers" :disabled="!billingForm.hasDefaultPaymentMethod" type="number" autocomplete="false" label="Max Viewers"></v-text-field>
                                        </v-col>
                                    </v-row>

                                    <v-row>
                                        <v-col>
                                            <v-text-field v-model="billingForm.maxStreamLength" :disabled="!billingForm.hasDefaultPaymentMethod" autocomplete="false" hint="in minutes" label="Max Stream Length"></v-text-field>
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
                                                        :disabled="hasSubStartDate || !billingForm.hasDefaultPaymentMethod"
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
                                            <small style="position: absolute; margin-top: -.75rem; opacity: .5">Subscription End Date: {{ billingForm.subscriptionEndDate | moment('l') }}</small>
                                        </v-col>
                                    </v-row>

                                    <v-row>
                                        <v-col>
                                            <vuetify-money v-model="billingForm.costPerAdditionalStream" :disabled="!billingForm.hasDefaultPaymentMethod" label="Cost Per Additional Stream" :options="currencyOptions" :rules="[v => !!v || 'Required']"></vuetify-money>
                                        </v-col>
                                        <v-col>
                                            <vuetify-money v-model="billingForm.costPer100Viewers" :disabled="!billingForm.hasDefaultPaymentMethod" label="Cost Per 100 Viewers" :options="currencyOptions" :rules="[v => !!v || 'Required']"></vuetify-money>
                                            <!-- <v-text-field v-model="billingForm.costPer100Viewers" label="Cost Per 100 Viewers" :rules="[v => !!v || 'Required']"></v-text-field> -->
                                        </v-col>
                                    </v-row>

                                    <v-row>
                                        <v-col>
                                            <vuetify-money v-model="billingForm.costPerFifteenMinute" :disabled="!billingForm.hasDefaultPaymentMethod" label="Cost Per Fifteen Minute" :options="currencyOptions" :rules="[v => !!v || 'Required']"></vuetify-money>
                                        </v-col>
                                        <v-col>
                                            <vuetify-money v-model="billingForm.subscriptionCost" :disabled="!billingForm.hasDefaultPaymentMethod" label="Subscription Cost" :options="currencyOptions" :rules="[v => !!v || 'Required']"></vuetify-money>
                                            <a href="https://www.notion.so/memoryshare/Adding-an-annual-plan-3d50ad830e4748dd96feca21985e55ca" target="_blank">How to Bill Annually</a>
                                        </v-col>
                                    </v-row>
                                </v-form>

                                <v-row>
                                    <v-col>
                                       
                                    </v-col>
                                    <v-col class="text-right">
                                        <v-btn @click="openCancelSubscriptionModal" color="red" dark class="mr-4 w-25"><alert-triangle-icon size="1.5x" class="mr-2" />cancel</v-btn>
                                        <v-btn @click="saveBilling" color="primary" :loading="busy" :disabled="busy" class="w-25">Save</v-btn>
                                    </v-col>
                                </v-row>
                            </div>

                            <v-dialog v-model="cancelDialog" max-width="360">
                                <v-card>
                                    <v-card-title class="headline">Cancel Subscription</v-card-title>
                                    <v-card-text>
                                        <v-checkbox v-model="confirmCancel" label="Inorder to cancel payment you must login to Stripe and Cancel the subscription" />
                                    </v-card-text>

                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn text @click="cancelDialog = false">cancel</v-btn>
                                        <v-btn color="red" :loading="busy" :disabled="busy" text @click="cancelSubscription">Confirm</v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>
                        </v-tab-item>

                        <v-tab-item value="profitability">
                             <div class="tab-padding">
                                <line-chart :chart-data="datacollection" :options="options" class="mt-8 mb-8"></line-chart> 
                             </div>
                        </v-tab-item>
                    </v-tabs-items>
                </div>
            </div>
        </div>

        <v-snackbar v-model="snackbar" :timeout="3000">
            {{ message }}
        </v-snackbar>
    </div>
</template>

<script>
import { SettingsIcon, UploadIcon, HomeIcon, CheckCircleIcon, XCircleIcon, AlertTriangleIcon } from 'vue-feather-icons';
import HomeSettings from '../components/HomeSettings';
import LineChart from '../components/charts/LineChart';

export default {
    metaInfo: {
      title: 'Admin Settings',
    },
    data() {
        return {
            busy: false,
            loading: false,
            token: '',
            tab: null,
            snackbar: false,
            message: '',
            stripeId: '',
            isDevHome: false,
            detailsForm: {
                name: '',
                address1: '',
                address2: '',
                city: '',
                state: '',
                zipCode: '',
                email: '',
                ownerId: 0,
                primaryContact: '',
                primaryContactPhoneNumber: '',
                primaryContactEmail: '',
                funeralHomeNumber: '',
                devHome: true,
            },
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
                stripePaymentToken: null,
                subscriptionEndDate: null,
                subscriptionStatus: null,
                hasDefaultPaymentMethod: null
            },
            currencyOptions: {
                locale: "en-us",
                prefix: "$",
                suffix: "",
                length: 8,
                precision: 2
            },
            hasSubStartDate: false,
            date: new Date(),
            menu: false,
            modal: false,
            menu2: false,
            cancelDialog: false,
            options: {
                responsive: true,
                maintainAspectRatio: false,
            },
            bandwidthData: {
                label: 'Bandwidth Data',
                borderColor: "#659fc3",
                backgroundColor: 'rgba(0,0,0,0)',
                data: [32, 45, 12, 45, 65, 43, 55]
            },
            streamingExpensesData: {
                label: 'Streaming Expenses',
                borderColor: "#65c3b8",
                backgroundColor: 'rgba(0,0,0,0)',
                data: [99, 120, 44, 54, 65, 23, 43]
            },
            totalExpenseseData: {
                label: 'Total Expenses',
                borderColor: "#c38965",
                backgroundColor: 'rgba(0,0,0,0)',
                data: [23, 45, 32, 87, 67, 66, 56]
            },
            profitData: {
                label: 'Profit',
                borderColor: "#6570c3",
                backgroundColor: 'rgba(0,0,0,0)',
                data: [76, 87, 67, 77, 88,55, 66]
            },
            datacollection: null,
            chartReady: false,
            confirmCancel: false,
            subscriptionStatus: ['active', 'cancelled'],
            OwnerIdList: [{ text: 'Shane', val: 0 }, { text: 'Vertin', val: 1 }, { text: 'Dev Home', val: 2 }, { text: 'Dev Owner', val: 3 }],
            requiredRules: [v => !!v || "This field is required"],
        }
    },
    watch: {
        'tab': {
            handler() { 
               if (this.tab === 'settings') {
                   setTimeout(() => {
                        this.$refs.homeSettings.getSettings();
                    })
               }

               if (this.tab === 'billing') {
                   this.getBilling();
               }

               if (this.tab === 'profitability') {
                   this.setChart();
               }
            }
        }
    },
    mounted() {
        this.$auth.getIdTokenClaims().then(result => {
            this.token = result.__raw;
            this.getHome()
        });
    },
    methods: { 
        setSnackBar(message) {
            this.message = message;
            this.snackbar = true;
        },
        getHome() {
            this.axios
                .create({ headers: {'Authorization': `Bearer ${ this.token }`} })
                .get(process.env.VUE_APP_API+ `/FuneralHomes/${ this.$route.params.id }`)
                .then(response => {
                    this.loading = false;
                    let result = response.data;

                    console.log(result)

                    this.detailsForm.name = result.funeralHome.name, 
                    this.detailsForm.address1 = result.funeralHome.address1, 
                    this.detailsForm.address2 = result.funeralHome.address2,
                    this.detailsForm.city = result.funeralHome.city,
                    this.detailsForm.state = result.funeralHome.state,
                    this.detailsForm.zipCode = result.funeralHome.zipCode,
                    this.detailsForm.email = result.funeralHome.email,
                    this.detailsForm.ownerId = result.funeralHome.ownerId,
                    this.detailsForm.primaryContact = result.funeralHome.primaryContact,
                    this.detailsForm.primaryContactEmail = result.funeralHome.primaryContactEmail,
                    this.detailsForm.primaryContactPhoneNumber = result.funeralHome.primaryContactPhoneNumber,
                    this.detailsForm.funeralHomeNumber = result.funeralHome.funeralHomeNumber,
                    this.detailsForm.devHome = result.funeralHome.devHome 

                    if (result.funeralHome.devHome) this.isDevHome = true;
                })
                .catch(error => {
                    console.log(error)
                    this.message = "Error! Please try again"
                    this.snackbar = true;
                })
        },
        saveHome() {
            this.busy = true;
            let valid = this.$refs.form.validate();
        
            if (valid) {    
                let data = {
                    name: this.detailsForm.name, 
                    address1: this.detailsForm.address1, 
                    address2: this.detailsForm.address2,
                    city: this.detailsForm.city,
                    state: this.detailsForm.state,
                    zipCode: this.detailsForm.zipCode,
                    email: this.detailsForm.email,
                    ownerId: this.detailsForm.ownerId,
                    primaryContact: this.detailsForm.primaryContact,
                    primaryContactEmail: this.detailsForm.primaryContactEmail,
                    primaryContactPhoneNumber: this.detailsForm.primaryContactPhoneNumber,
                    funeralHomeNumber: this.detailsForm.funeralHomeNumber,
                    devHome: this.detailsForm.devHome 
                } 

                this.axios
                    .create({ headers: {'Authorization': `Bearer ${ this.token }`} })
                    .put(process.env.VUE_APP_API + `/FuneralHomes/${ this.$route.params.id }`, data)
                    .then(response => {
                        this.message = `Home successfully updated`;
                    })
                    .catch(error => {
                        console.log(error)
                        console.log(error.response)
                        this.message = "Error! Please try again"
                    })
                    .then(() => {
                         this.snackbar = true;
                         this.busy = false;
                    })
            }
        },
        openBillingPortal() {
            this.axios
                .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                .get(process.env.VUE_APP_API + `/funeralhomes/billing/portal/${ this.$route.params.id }`)
                .then(response => {
                    console.log(response.data)
                    window.open(response.data, '_blank')
                })
                .catch(error => {
                    console.log(error)
                    console.log(error.response)
                    this.$swal.fire({
                        icon: 'error',
                        title: 'Error Opening Stripe Portal'
                    })
                })        
        },
        getBilling() {
            this.loading = true;
            this.axios
                .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                .get(process.env.VUE_APP_API + `/funeralhomes/billing/${ this.$route.params.id }`)
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
                    this.billingForm.subscriptionCost = (response.data.subscriptionCost / 100);
                    this.stripeId = response.data.stripeCustomerId;

                    console.log(this.billingForm)
                })
                .catch(error => {
                    console.log(error)
                    this.$swal.fire({
                        icon: 'error',
                        title: 'Error getting billing data'
                    })
                })
                .then(() => {
                    this.loading = false;
                })
        },
        saveBilling() {
            let formValid = this.$refs.billingForm.validate();
            if (!formValid) return;
            this.busy = true;

            let data = {
                funeralHomeId: +this.$route.params.id,
                streamsPerMonth: +this.billingForm.streamsPerMonth,
                costPerAdditionalStream: +this.billingForm.costPerAdditionalStream.toString().includes('.') ? +this.billingForm.costPerAdditionalStream.toString().replace('.', '') : (this.billingForm.costPerAdditionalStream * 100),
                maxStreamLength: +this.billingForm.maxStreamLength,
                costPerFifteenMinute: +this.billingForm.costPerFifteenMinute.toString().includes('.')? +this.billingForm.costPerFifteenMinute.replace('.', '') : (this.billingForm.costPerFifteenMinute * 100),
                maxViewers: +this.billingForm.maxViewers,
                costPer100Viewers: +this.billingForm.costPer100Viewers.toString().includes('.') ? +this.billingForm.costPer100Viewers.replace('.', '') : (this.billingForm.costPer100Viewers * 100),
                billedAnnually: false,
                subscriptionCost: +this.billingForm.subscriptionCost.toString().includes('.') ? +this.billingForm.subscriptionCost.replace('.', '') : (this.billingForm.subscriptionCost * 100),
                subscriptionStartDate: new Date(this.billingForm.subscriptionStartDate).toISOString(),
                // stripePaymentToken: this.billingForm.stripePaymentToken
            }

            console.log(data)

            this.axios
                .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                .post(process.env.VUE_APP_API + '/funeralhomes/billing', data)
                .then(response => {
                    console.log(response)
                    this.message = 'Billing Updated'
                })
                .catch(error => {
                    console.log(error)
                    this.message = error.response.data.title;
                })
                .then(() => {
                    this.snackbar = true;
                    this.busy = false;
                })
        },
        goToStripeDashboard() {
            window.open(` https://dashboard.stripe.com/test/customers/${ this.stripeId }`, '_blank')
        },
        openCancelSubscriptionModal() {
            this.confirmCancel = false;
            this.cancelDialog = true;
        },
        cancelSubscription() {
            if (!this.confirmCancel) {
                this.message = 'You must confrim subscription is canceled in Stripe to proceed'
                this.snackbar = true;
            } else {
                this.axios
                    .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                    .get(process.env.VUE_APP_API + `/funeralhomes/billing/cancel/${ this.$route.params.id }`)
                    .then(response => {
                        console.log(response)
                        this.message = 'Subscription cancelled'
                        this.cancelDialog = false;
                        this.getBilling();
                    })
                    .catch(error => {
                        console.log(error)
                        this.message = 'Error endding subscription'
                    })
                    .then(() => {
                        this.snackbar = true;
                    }) 
            }
        },
        setChart() {
            let labels = [];
            for (let i = 0; i < 7; i++) {
                labels.push(this.$moment(this.startOfWeek).add(i, 'days').format("MM/DD/YYYY"))
            } 
            this.datacollection = {
                labels: labels,
                datasets: [
                    this.bandwidthData,
                    this.streamingExpensesData,
                    this.totalExpenseseData,
                    this.profitData
                ]
            }
        }
    },
    components: {
        SettingsIcon,
        HomeSettings,
        LineChart,
        CheckCircleIcon,
        XCircleIcon,
        AlertTriangleIcon
    }
}
</script>

<style lang="scss" scoped>
    .dash-container {
        background: url('https://d1pnnwteuly8z3.cloudfront.net/images/1fde3b9d-4dc8-422c-8e23-bbe443fd0870/f9ae4de7-3055-49e2-885e-92405c900525.svg') no-repeat 0 3rem;
    }

    .tab-padding {
        padding: 3rem;
    }
</style>