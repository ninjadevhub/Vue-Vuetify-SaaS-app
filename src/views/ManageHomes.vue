<template>
    <div>
        <side-nav></side-nav>
        <div v-bind:class="[{ 'menu-showing': this.$store.state.menuShowing }, 'dash-container']">
            <div class="tile form">
                <div class="header">
                    <h3 class="title">
                        <home-icon size="1.25x"></home-icon>
                        {{ editing ? `Editing ${name}` : 'Create New Home'}}
                    </h3>
                </div>

                 <v-form class="form-container" ref="form" lazy-validation>
                    <v-text-field v-model="name" :rules="[v => !!v || 'Name is required']" label="Funeral Home Name" required></v-text-field>
                    <v-text-field v-model="address1" label="Address 1" required></v-text-field>
                    <v-text-field v-model="address2" label="Address 2" required></v-text-field>

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

                    <v-text-field v-model="email" :rules="[v => !!v || 'Email is required']" label="Email" type="email" required></v-text-field>

                    <v-select v-model="ownerId" :items="OwnerIdList" item-text="text" item-value="val" label="Owner Id"></v-select>

                    <v-text-field v-model="primaryContact" :rules="[v => !!v || 'Primary Contact is required']" label="Primary Contact Name" required></v-text-field>
                    
                    <v-text-field v-model="primaryContactPhoneNumber" v-mask="'###.###.####'" label="Primary Contact Phone" type="phone" required></v-text-field>

                    <v-text-field v-model="primaryContactEmail" :rules="[v => !!v || 'Email is required']"  label="Primary Contact Email" type="email" required></v-text-field>
                    
                    <v-text-field v-model="funeralHomeNumber" v-mask="'###.###.####'" :rules="[v => !!v || 'Funeral Home Number is required']" type="phone" label="Funeral Home Number" required></v-text-field>

                    <v-checkbox v-model="devHome" label="*Dev Home (Will be ignored from analytics, and billing)"></v-checkbox>

                     <div class="text-right mt-10 mb-6">                        
                        <button @click.prevent="saveHome($data)" class="btn btn-primary ml-3 save-btn">Save Home</button>
                    </div>

                 </v-form>
                 <Spinner v-if="loading"></Spinner>
            </div>

            <v-snackbar v-model="snackbar" :timeout="3000">
                {{ message }}
            </v-snackbar>
        </div>
    </div>
</template>

<script>
import Spinner from '../components/Spinner';
import { HomeIcon } from 'vue-feather-icons';


export default {
    metaInfo: {
      title: 'Manage Homes',
    },
    data() {
        return {
            loading: true,
            editing: false,
            token: '',
            snackbar: false,
            message: '',
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
            OwnerIdList: [{ text: 'Shane', val: 0 }, { text: 'Vertin', val: 1 }, { text: 'Dev Home', val: 2 }, { text: 'Dev Owner', val: 3 }],
            requiredRules: [v => !!v || "This field is required"],
        }
    },
    mounted() {
        if (this.$route.params.id) {
            this.loading = true;
            this.editing = true;
            this.getHome(+this.$route.params.id)
        } else {
            this.loading = false;
        }
    },
    methods: {
        saveHome(payload) {
            let valid = this.$refs.form.validate();
        
            if (valid) {    
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

                // temp
                this.$auth.getIdTokenClaims().then(result => {
                    const _TOKEN = result.__raw;
                    let query = process.env.VUE_APP_API + '/FuneralHomes'

                    if (this.editing) {
                        query = `${query}/${this.$route.params.id}`;
                        
                        this.axios
                            .create({ headers: {'Authorization': `Bearer ${_TOKEN}`} })
                            .put(query, data)
                            .then(response => {
                                this.message = `${this.name} successfully updated`;
                                this.snackbar = true;
                                this.$router.push({name: 'Homes'}) 
                            })
                            .catch(error => {
                                console.log(error)
                                this.message = "Error! Please try again"
                                this.snackbar = true;
                            })

                    } else {
                        this.axios
                            .create({ headers: {'Authorization': `Bearer ${_TOKEN}`} })
                            .post(query, data)
                            .then(response => {
                                this.message = `${this.name} successfully added`;
                                this.snackbar = true;
                                this.$router.push({name: 'Homes'}) 
                            })
                            .catch(error => {
                                console.log(error)
                                this.message = "Error! Please try again"
                                this.snackbar = true;
                            })
                    }
                })
            } else {
                this.message = "Error! Please fix form errors"
                this.snackbar = true;
            }
        },
        getHome(id) {
            this.$auth.getIdTokenClaims().then(result => {
                const _TOKEN = result.__raw;

                this.axios
                .create({ headers: {'Authorization': `Bearer ${_TOKEN}`} })
                .get(process.env.VUE_APP_API+ `/FuneralHomes/${id}`)
                .then(response => {
                    this.loading = false;
                    let result = response.data;

                    console.log(result)

                    this.name = result.funeralHome.name, 
                    this.address1 = result.funeralHome.address1, 
                    this.address2 = result.funeralHome.address2,
                    this.city = result.funeralHome.city,
                    this.state = result.funeralHome.state,
                    this.zipCode = result.funeralHome.zipCode,
                    this.email = result.funeralHome.email,
                    this.ownerId = result.funeralHome.ownerId,
                    this.primaryContact = result.funeralHome.primaryContact,
                    this.primaryContactEmail = result.funeralHome.primaryContactEmail,
                    this.primaryContactPhoneNumber = result.funeralHome.primaryContactPhoneNumber,
                    this.devHome = result.funeralHome.devHome 
                })
                .catch(error => {
                    console.log(error)
                    this.message = "Error! Please try again"
                    this.snackbar = true;
                })
            })
        }
    },
    components: {
        Spinner,
        HomeIcon
    }
}
</script>

<style lang="scss" scoped>
    .row {
        margin-top: 1.5rem;
    }

    .custom-checkbox {
        margin-top: 1rem;
    }

    .save-btn {
        width: 40%;
    }

    .form-group {
        margin-top: 2rem;
    }
</style>