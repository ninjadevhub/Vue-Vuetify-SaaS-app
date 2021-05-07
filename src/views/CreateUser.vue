<template>
    <div>
        <div v-bind:class="[{ 'menu-showing': this.$store.state.menuShowing }, 'dash-container']">  
            <div class="tile form">

                <div class="text-center">
                    <img :src="require(`@/assets/images/logo_title.png`)" alt="logo" class="logo">
                </div>

                <v-form class="form-container" ref="form" v-model="valid">
                    <h2>Create Account</h2>
                    <h6>Hello, {{ this.$route.query.email.replace(/\s+/g, '+') }}! Create a password to get started.</h6>

                    <v-text-field :rules="[rules.password]" v-model="password" type="password" label="Password" class="mt-6"></v-text-field>
                    <v-text-field :rules="[rules.password]" v-model="confirmPassword" type="password" label="Confirm Password"></v-text-field>
                    <p v-if="showError" class="text-danger mb-0 font-weight-bolder">* Passwords must match</p>

                    <button @click.prevent="submit($data)" :disabled="this.password.length === 0 || this.confirmPassword.length === 0" class="btn btn-gradient font-weight-bold w-100 mt-8">Create Account</button>
                </v-form>

                <div v-if="submitting" class="spinner-container">
                    <v-progress-circular :size="64" color="#FF530D" indeterminate class="spinner mb-4"></v-progress-circular>
                    <h5>creating account...</h5>
                </div>
            </div>
        </div>

        <v-snackbar v-model="snackbar" :timeout="2000">
            {{ message }}
        </v-snackbar>
    </div>
</template>

<script>
import { SmileIcon } from 'vue-feather-icons';
import Spinner from '../components/Spinner';

export default {
    metaInfo: {
      title: 'Create User',
    },
    data() {
        return {
            snackbar: false,
            submitting: false,
            valid: true,
            message: '',
            password: '',
            confirmPassword: '',
            showError: false,
            rules: {
                required: value => !!value || "Required.",
                password: value => {
                const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
                return (
                    pattern.test(value) ||
                    "Min. 8 characters with at least one capital letter, a number and a special character."
                )}
            }
        }
    },
    components: {
        SmileIcon,
        Spinner
    },
    methods: {
        createUser() {
            this.submitting = true;
            this.axios        
                .post(process.env.VUE_APP_API + '/users/create', {
                    token: this.$route.query.token,
                    email: this.$route.query.email.replace(/\s+/g, '+'),
                    password: this.password
                })
                .then(response => {
                    console.log(response)
                    this.message = `Account created! Welcome ${this.$route.query.email.replace(/\s+/g, '+')}!`;
                    this.snackbar = true;
                    this.$router.push({name: 'Services'}) 
                })
                .catch(error => {
                    console.log(error)
                    console.log(error.response)
                    this.message = `Error! ${error.response.data}`
                    this.snackbar = true;
                }).then(() => {
                    this.submitting = false; 
                }) 
        },
        submit() {
            if (this.password !== this.confirmPassword) {
                this.snackbar = true;
                this.message = 'Error! Passwords must match';
                this.showError = true;
                return
            }

            // need to add validation rules

            this.createUser()
        }
    },
    mounted() {
        this.$store.dispatch('toggleTopNav')
        console.log(this.$route.query)
        //this.createUser();
    }
}
</script>

<style lang="scss" scoped>
    .tile {
        width: 40%;
    }

    .dash-container {
        margin-left: 0;
        background: url('https://d1pnnwteuly8z3.cloudfront.net/images/1fde3b9d-4dc8-422c-8e23-bbe443fd0870/3db295f3-24bb-4347-8d2e-c58abfeb92aa.svg') no-repeat;
    }

    .tile {
        padding: 4rem 2rem;
        box-shadow: 0 0 1rem #666;

        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        margin: 0;
    }

    .spinner-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        padding-top: 35%;
        background: rgba(255,255,255,.8);
        text-align: center;
    }

    .logo {
        margin: 0 auto;
        width: 30%;
        height: auto;
    }
</style>