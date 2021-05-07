<template>
    <div>
        <side-nav></side-nav>
        <div v-bind:class="[{ 'menu-showing': this.$store.state.menuShowing }, 'dash-container']">
            <div class="tile elevation-6">
                <div class="header">
                    <h4><settings-icon size="1x" class="mr-4"></settings-icon> Settings</h4>
                </div>

                <div>
                    <v-tabs v-model="tab" color="#0d5259">
                        <v-tab href="#home">Home</v-tab>
                        <v-tab href="#general">General</v-tab>
                        <v-tab href="#subscription">Subscription</v-tab>
                    </v-tabs>

                    <v-tabs-items :value="tab">
                        <v-tab-item value="home">
                            <v-form @submit.prevent="submit" ref="form">
                                <WelcomeModal />
                                <v-chip class="mb-6" color="primary">
                                 <home-icon size="1.25x" class="mr-3"></home-icon> <h6 class="mb-0">This Is A Test Home</h6>
                                </v-chip>

                                <v-text-field readonly v-model="name" label="Name" required ></v-text-field>
                                <v-text-field v-model="address1" label="Address 1" required ></v-text-field>
                                <v-text-field v-model="address2" label="Address 2" required ></v-text-field>

                                <v-row class="mt-0">
                                    <v-col>
                                        <v-text-field v-model="city" label="City" required></v-text-field>
                                    </v-col>
                                    
                                    <v-col>
                                        <v-text-field v-model="state" label="State" required></v-text-field>
                                    </v-col>

                                    <v-col>
                                        <v-text-field v-model="zipCode" label="Zip" required></v-text-field>
                                    </v-col>
                                </v-row>

                                <v-text-field v-model="email" label="Email" type="email" required ></v-text-field>
                                <v-text-field v-model="primaryContact" label="Primary Contact" required ></v-text-field>
                                <v-text-field v-model="primaryContactPhoneNumber" label="Primary Contact Phone Number" required ></v-text-field>
                                <v-text-field v-model="primaryContactEmail" label="Primary Contact Email" type="email" required ></v-text-field>
                                <v-text-field v-model="funeralHomeNumber" v-mask="'###.###.####'" :rules="[v => !!v || 'Funeral Home Number is required']" type="phone" label="Funeral Home Number" required></v-text-field>
                                
                                <div class="mt-8 text-right">
                                    <v-btn @click="update">Update</v-btn>
                                </div>
                            </v-form>
                        </v-tab-item>
                        
                        <v-tab-item value="general">                     
                            <div>
                                <home-settings modal="false" :token="token" ref="homeSettings" /> 
                            </div>
                        </v-tab-item>

                        <v-tab-item value="subscription">
                            <v-row>
                                <v-col>
                                    <h5 class="mb-4">Update Billing</h5>
                                    <v-btn @click="openBillingPortal" color="primary" class="mb-2">Update Payment and Billing Address</v-btn>
                                </v-col>
                                <v-col v-if="this.subStart" class="text-right mt-2">
                                    {{ this.subStart | moment('l') }} - {{ this.subEnd | moment('l') }}
                                </v-col>    
                            </v-row>

                            <h5 class="mt-12">Billing Events</h5>
                            <v-data-table
                                :headers="headers"
                                :items="billingEvents"
                                :loading="loading"
                                loading-text="Getting Billing Events...">

                                <template v-slot:item.event="{ item }">  
                                    <v-chip>{{ eventTypes[item.eventType] }}</v-chip>
                                </template> 

                                <template v-slot:item.amount="{ item }">  
                                    <span>${{ item.amount.toFixed(2) }}</span>
                                </template> 

                                <template v-slot:item.date="{ item }">  
                                    <p class="pt-6 pb-6 mb-0">{{ item.reportedDate | moment('l') }}</p>
                                </template> 
                            </v-data-table>
<!-- 
                            <div class="w-50">
                                <h4>Current Plan</h4> 
                                <h6 class="mt-2">Standard</h6>       
                                100/120 streaming minutes
                                <v-progress-linear value="80"></v-progress-linear>
                                <AddonsModal />

                                <h5 class="mt-10 mb-2">Billing</h5>
                                <p class="mt-2 mb-2">next billing date: 10/10/2020</p>
                                <p v-if="!editCard">Using card ending with <strong>4141</strong> <span @click="editBillingCard" class="text-primary">change</span></p>
                                <StripeCard v-else />
                            </div> -->

                            <!-- <StripeCard /> -->
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
import { SettingsIcon, UploadIcon, HomeIcon } from 'vue-feather-icons';
import WelcomeModal from '../components/WelcomeModal';
import StripeCard from '../components/StripeCard';
import AddonsModal from '../components/AddonsModal';
import HomeSettings from '../components/HomeSettings'

export default {
    metaInfo: {
      title: 'Settings',
    },
    data() {
        return {
            tab: null,
            name: '',
            address1: '',
            address2: '',
            city: '',
            state: '',
            zipCode: '',
            email: '',
            primaryContact: '',
            primaryContactPhoneNumber: '',
            primaryContactEmail: '',
            funeralHomeNumber: '',
            token: '',
            displayTutorial: true,
            editCard: false,
            snackbar: false,
            message: '',
            billingEvents: [],
            loading: false,
            subStart: null,
            subEnd: null,
            eventTypes: ['Streaming Overage', 'Viewer Overage', 'Service Overage'],
            headers: [
                { text: 'Date', value: 'date' },
                { text: 'Event', value: 'event' },
                { text: 'Amount', value: 'amount', width: '13%' },
                { text: 'Description', value: 'description' },
            ]
        }
    },
    watch: {
        'tab': {
            handler() { 
                if (this.tab === 'general') {
                    setTimeout(() => {
                        this.$refs.homeSettings.getSettings();
                    })
                    if (this.uppy === '') {
                        setTimeout(() => {
                            this.$refs.homeSettings.initUppy();
                        }) 
                    }
                }

                if (this.tab === 'subscription') {
                    this.loading = true;
                    this.getBillingEvents();
                }
            }
        }
    },
    methods: {
        getHome() {
            this.loading = true;
            this.$auth.getIdTokenClaims().then(result => {
                this.token = result.__raw;

                this.axios
                    .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                    .get(process.env.VUE_APP_API + `/funeralhomes/${this.$auth.funeralHomeId}`)
                    .then(response => {
                        const home = response.data.funeralHome;
                        this.name = home.name;
                        this.address1 = home.address1;
                        this.address2 = home.address2;
                        this.city = home.city;
                        this.state = home.state;
                        this.zipCode = home.zipCode;
                        this.email = home.email;
                        this.primaryContact = home.primaryContact;
                        this.primaryContactPhoneNumber = home.primaryContactPhoneNumber;
                        this.primaryContactEmail = home.primaryContactEmail;
                        this.funeralHomeNumber = home.funeralHomeNumber

                        this.subStart = home.currentBillingPeriodStart;
                        this.subEnd = home.currentBillingPeriodEnd;

                        console.log(response)
                    })
            });
        },
        getBillingEvents() {
            ///funeralhomes/billing/events/43?pageSize=10&sortBy=ReportedDate&sortAsc=true
            this.axios
                .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                .get(process.env.VUE_APP_API + `/funeralhomes/billing/events/${ this.$auth.funeralHomeId }?pageSize=10&sortBy=ReportedDate&sortAsc=true`)
                .then(response => {
                    console.log(response)
                    this.billingEvents = response.data.billingEvents;
                })
                .catch(error => {
                    console.log(error)
                })
                .then(() => {
                    this.loading = false;
                })
        },
        openBillingPortal() {
            this.axios
                .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                .get(process.env.VUE_APP_API + `/funeralhomes/billing/portal/${ this.$auth.funeralHomeId }`)
                .then(response => {
                    console.log(response.data)
                    window.open(response.data, '_blank')
                })
                .catch(error => {
                    console.log(error)
                })        
        },
        update() {
            let valid = this.$refs.form.validate();
        
            if (valid) {    
                this.loading = true;
                let data = {
                    name: this.name, 
                    address1: this.address1, 
                    address2: this.address2,
                    city: this.city,
                    state: this.state,
                    zipCode: this.zipCode,
                    email: this.email,
                    ownerId: this.ownerId,
                    primaryContact: this.primaryContact,
                    primaryContactEmail: this.primaryContactEmail,
                    primaryContactPhoneNumber: this.primaryContactPhoneNumber,
                    funeralHomeNumber: this.funeralHomeNumber,
                    devHome: this.devHome 
                } 

                this.axios
                    .create({ headers: {'Authorization': `Bearer ${ this.token }`} })
                    .put(process.env.VUE_APP_API + `/funeralHomes/${ this.$auth.funeralHomeId }`, data)
                    .then(response => {
                        this.message = `Settings successfully updated`;
                        this.$router.push({name: 'Homes'}) 
                    })
                    .catch(error => {
                        console.log(error)
                        this.message = "Error! Please try again"
                    })
                    .then(() => {
                        this.snackbar = true;
                        this.loading = false;
                    })
            }
        },
        getHomeSettings() {
            this.axios
                .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                .get(process.env.VUE_APP_API + `/funeralhomes/settings/${this.$auth.funeralHomeId}`)
                .then(response => {
                    console.log(response)
                })
        },
        editBillingCard() {
            this.editCard = true;
        }      
    },
    mounted() {
        this.getHome();
    },
    components: {
        SettingsIcon,
        UploadIcon,
        HomeIcon,
        WelcomeModal,
        StripeCard,
        AddonsModal,
        HomeSettings
    }
}
</script>

<style lang="scss" scoped>
    .dash-container {
        background: url('https://d1pnnwteuly8z3.cloudfront.net/images/1fde3b9d-4dc8-422c-8e23-bbe443fd0870/f9ae4de7-3055-49e2-885e-92405c900525.svg') no-repeat 0 3rem;
    }

    .tile {
        width: 70%;
        margin: 4rem auto 10%;
        padding: 2rem inherit;
    }

    .v-tabs-items {
        padding: 3rem 2rem;
    }

    #uppy-select-files {
        h6 {
            display: inline-block;
        }
    }

    .callout-section {
        vertical-align: bottom;
    }
</style>