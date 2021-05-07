<template>
    <div>
        <side-nav></side-nav>
        <div v-bind:class="[{ 'menu-showing': this.$store.state.menuShowing }, 'dash-container']">
            <div class="tile form elevation-6">
                <div class="header">
                    <h3 class="title">
                          <user-plus-icon size="1.5x"></user-plus-icon> {{ editing ? 'Edit User' : 'Create New User' }}
                     </h3>
                </div>

                <v-form class="form-container" ref="form" lazy-validation>
                    <v-row>
                        <v-col>
                            <v-text-field v-model="firstName" label="First Name" :rules="[v => !!v || 'First name is required']"></v-text-field>
                        </v-col>
                        <v-col>
                             <v-text-field v-model="lastName" label="Last Name" :rules="[v => !!v || 'Last name is required']"></v-text-field>
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col>
                            <v-text-field :disabled="editing" v-model="email" type="email" label="Email" :rules="[v => !!v || 'Email is required']"></v-text-field>
                        </v-col>
                        <v-col>
                            <v-autocomplete v-if="!editing" v-model="funeralHome" :items="homes" label="Funeral Home" item-text="name" item-value="id"></v-autocomplete>
                        </v-col>
                    </v-row>

                    <v-alert v-if="errorMessage.length" type="error">
                        {{ errorMessage }}
                    </v-alert>

                    <div class="text-right mt-4">
                        <v-btn @click="$router.go(-1)" text class="mr-4">cancel</v-btn>
                        <v-btn @click.prevent="createUser()" color="primary"> {{ editing ? 'Update User' : 'Create User' }}</v-btn>
                    </div>
                </v-form>
            </div>
        </div>

        <v-snackbar v-model="snackbar" :timeout="3000">
            {{ message }}
        </v-snackbar>
    </div>
</template>

<script>
import { UserPlusIcon } from 'vue-feather-icons'

export default {
    metaInfo: {
      title: 'Manage Users',
    },
    data() {
        return {
            firstName: '',
            lastName: '',
            email: '',
            message: '',
            snackbar: false,
            homes: [],
            funeralHome: '',
            token: '',
            errorMessage: '',
            editing: false
        }
    },
    mounted() {
        if (this.$route.params.id) {
            this.editing = true
            this.getUser()
        } else {
            this.getHomes();
        }
    },
    methods: {
      getUser() {
        this.$auth.getIdTokenClaims().then(result => {
            this.token = result.__raw;

            this.axios
                .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                .get(process.env.VUE_APP_API + `/users/${ this.$route.params.id }`)
                .then(response => {
                    this.firstName = response.data.firstName;
                    this.lastName = response.data.lastName;
                    this.email = response.data.email;
                })
                .catch(error => {
                    console.log(error)
                })
        });
    },
      getHomes() {
            this.$auth.getIdTokenClaims().then(result => {
                this.token = result.__raw;

                this.axios
                    .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                    .get(process.env.VUE_APP_API + '/FuneralHomes')
                    .then(response => {
                        this.homes = response.data.homes;
                        //this.loading = false; 
                    })
                    .catch(error => {
                        console.log(error)
                    })
            });
        },
        createUser() {
            this.errorMessage = '';

            if (this.editing) {
                 let data = {
                    firstName: this.firstName,
                    lastName: this.lastName,
                    id: +this.$route.params.id
                }

                this.axios
                    .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                    .put(process.env.VUE_APP_API + '/users/', data)
                    .then(response => {
                        this.message = 'User Updated';
                        this.$router.go(-1)
                    })
                    .catch(error => {
                        console.log(error)
                        this.errorMessage = error.response.data;
                        this.message = 'Error updating user'
                    })
                    .then(() => {
                        this.snackbar = true;
                    })

            } else {
                // new user
                let data = {
                    firstName: this.firstName,
                    lastName: this.lastName,
                    email: this.email,
                    funeralHomeId: this.funeralHome
                }

                this.axios
                    .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                    .post(process.env.VUE_APP_API + '/users/invite', data)
                    .then(response => {
                        this.message = 'User created';
                        this.$router.go(-1)
                    })
                    .catch(error => {
                        console.log(error)
                        this.errorMessage = error.response.data;
                        this.message = 'Error creating user'
                    })
                    .then(() => {
                        this.snackbar = true;
                    })
            }
        },
        sendInvite() {
            this.axios
                .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                .post(process.env.VUE_APP_API + '/users/invite', {
                    firstName: this.firstName,
                    lastName: this.lastName,
                    email: this.email,
                })
                .then(response => {
                    console.log(response)
                    this.message = `Invite successfully sent to ${this.firstName} ${this.lastName}`;
                    this.snackbar = true;
                    this.$router.push({name: 'Users'}) 
                })
                .catch(error => {
                    console.log(error)
                    console.log(error.response)
                    this.message = `Error! ${error.response.data}`
                    this.snackbar = true;
                })
        }
    },
    components: {
        UserPlusIcon
    }
}
</script>

<style lang="scss" scoped>
    .dash-container {
        background: url('https://d1pnnwteuly8z3.cloudfront.net/images/1fde3b9d-4dc8-422c-8e23-bbe443fd0870/f9ae4de7-3055-49e2-885e-92405c900525.svg') no-repeat 0 3rem;
    }

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