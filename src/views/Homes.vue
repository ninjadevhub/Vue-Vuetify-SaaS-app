<template>
    <div>
        <side-nav></side-nav>
        <div v-bind:class="[{ 'menu-showing': this.$store.state.menuShowing }, 'dash-container']">
             <div class=text-right>
                <router-link :to="{ name: 'ManageHomes' }" class="btn btn-primary"><span>+</span> Create New Home</router-link>
            </div>
   
                <v-card>
                    <v-card-title>
                      <home-icon size="1.25x" class="mb-1 mr-2"></home-icon> <h4>Homes</h4>
                    <v-spacer></v-spacer>
                    <v-text-field
                        v-model="search"
                        append-icon="mdi-magnify"
                        label="Search"
                        @input="watchSearch"
                        v-on:keyup.enter="getHomes"
                        single-line
                        hide-details
                    ></v-text-field>
                    </v-card-title>
                    <v-data-table
                        :headers="headers"
                        :items="homes"
                        :options.sync="options"
                        :server-items-length="totalHomes"
                        :loading="loading"
                        loading-text="Getting homes..."
                        :search="search">

                    <template v-slot:item.name="{ item }">
                        <div class="position-relative">
                            {{ item.name }}
                            <div v-if="item.devHome" style="line-height: .9rem">
                                <small style="color: #FF530D">Dev Home</small>
                                <div class="dev-home-border"></div>
                            </div>
                        </div>
                    </template> 

                    <template v-slot:item.contact="{ item }">
                        <a :href="`mailto:${item.email}`">{{ item.email }}</a>
                    </template> 

                    <template v-slot:item.location="{ item }">
                        <span v-if="item.city && item.state">{{ item.city + ', ' + item.state }}</span>
                        <span v-else>{{ item.city + '' + item.state }}</span>
                    </template>  

                    <template v-slot:item.lastLogin="{ item }">
                        <span v-if="item.lastLogin" class="d-block">{{ item.lastLogin | moment('M/D/YY') }}</span>
                        <span v-if="item.lastLogin" class="d-block">{{ item.lastLogin | moment('hh:mm a') }}</span>
                    </template>  

                    <template v-slot:item.paymentStatus="{ item }">
                        <check-icon v-if="item.paymentStatus === 'paid'" class="text-success mr-1"></check-icon> 
                        <alert-circle-icon v-if="item.paymentStatus === 'notPaid'" class="text-danger mr-1"></alert-circle-icon> 
                        {{ item.paymentStatus }}
                    </template>   

                     <template v-slot:item.actions="{ item }">
                         <div class="action-list">
                             <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <span @click="goToSettings(item.id)" v-bind="attrs" v-on="on">
                                        <settings-icon size="1.25x"></settings-icon>
                                    </span>
                                </template>

                                <span>Settings</span>
                            </v-tooltip>

                             <!-- <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <span @click="updateSettings(item)" v-bind="attrs" v-on="on">
                                        <settings-icon size="1.25x"></settings-icon>
                                    </span>
                                </template>

                                <span>Settings</span>
                            </v-tooltip>

                             <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <span @click="editHome(item.id)" v-bind="attrs" v-on="on">
                                        <edit-2-icon size="1.25x"></edit-2-icon>
                                    </span>
                                </template>

                                <span>Edit Home</span>
                            </v-tooltip>

                              <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <span @click="updateBilling(item)" v-bind="attrs" v-on="on">
                                        <dollar-sign-icon size="1.25x"></dollar-sign-icon>
                                    </span>
                                </template>

                                <span>Update Billing</span>
                            </v-tooltip> -->

                             <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <span v-bind="attrs" v-on="on">
                                        <users-icon @click="getUsers(item)" size="1.25x"></users-icon>
                                    </span>
                                </template>

                                <span>Users</span>
                            </v-tooltip>

                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <span @click="impersonate(item.id)" v-bind="attrs" v-on="on">
                                        <user-plus-icon size="1.25x"></user-plus-icon>
                                    </span>
                                </template>

                                <span>Impersonate</span>
                            </v-tooltip>

                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <span v-bind="attrs" v-on="on" @click="openDeleteModal(item)">
                                        <trash-2-icon size="1.25x"></trash-2-icon>
                                    </span>
                                </template>

                                <span>Delete</span>
                            </v-tooltip>

                            <v-dialog
                                    v-model="deleteModal"
                                    :retain-focus="false"
                                    persistent
                                    max-width="290">

                                    <v-card>
                                        <v-card-title class="headline">
                                        Delete Home?
                                        </v-card-title>
                                        <v-card-text>{{ deleteMessage }}?</v-card-text>
                                        <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn
                                            color="gdarken-1"
                                            text
                                            @click="closeDeleteModal()"
                                        >
                                            cancel
                                        </v-btn>
                                        <v-btn
                                            color="red darken-1"
                                            text
                                            @click="deleteHome()"
                                        >
                                            Delete
                                        </v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-dialog>
                            </div>
                        </template>   

                    </v-data-table>
                </v-card>
            <users-table ref="usersTable" />

            <v-snackbar v-model="errorLoading">
                Error getting data

                <template v-slot:action="{ attrs }">
                    <v-btn color="red" text v-bind="attrs" @click="getHomes()">
                        Retry
                    </v-btn>
                </template>
            </v-snackbar>

            <v-snackbar v-model="snackbar" :timeout="2000"> 
                {{ message }}
            </v-snackbar>
        </div>
    </div>
</template>

<script>
import { HomeIcon, CheckIcon, AlertCircleIcon, Edit2Icon, SettingsIcon, UsersIcon, MailIcon, Trash2Icon, UserPlusIcon, DollarSignIcon } from 'vue-feather-icons';
import UsersTable from '../components/UsersTable';

export default {
    metaInfo: {
      title: 'Homes',
    },
    data() {
        return {
            loading: true,
            snackbar: false,
            search: '',
            message: '',
            deleteModal: false,
            errorLoading: false,
            deleteMessage: '',
            selectedIndex: 0,
            selectedId: null,
            totalHomes: 0,
            sortAsc: false,
            sortBy: 'CreateDate',
            headers: [
                { text: 'Id', value: 'id' },
                { text: 'Home', value: 'name' },
                { text: 'Location', value: 'location' },
                { text: 'Conatct', value: 'contact' },
                { text: 'Funeral Home Owner', value: 'owner' },
                { text: 'Last Login', value: 'lastLogin' },
                { text: 'Payment Status', value: 'paymentStatus' },
                { text: 'Actions', value: 'actions', width: '20%', align: 'center' },
            ],
            search: '',
            homes: [],
            token: '',
            options: {},
        }
    },
    components: {
        HomeIcon,
        CheckIcon,
        AlertCircleIcon,
        Edit2Icon,
        SettingsIcon,
        UsersIcon,
        MailIcon,
        Trash2Icon,
        UserPlusIcon,
        DollarSignIcon,
        UsersTable
    },
    watch: {
        options: {
            handler() {
                this.getHomes();
            },
        },
        deep: true,
    },
    methods: {
        openDeleteModal(item) {
            this.deleteMessage = `Are you sure you want to delete the service for ${item.name}`;
            this.selectedIndex = this.homes.indexOf(item)
            this.deleteModal = true;
            this.selectedId = item.id;
        },
        closeDeleteModal() {
            this.deleteModal = false
        },
        getHomes() {  
            const { sortBy, sortDesc, page, itemsPerPage } = this.options
            this.loading = true; 
            this.errorLoading = false;
            //history.replaceState(undefined, undefined, `?page=${ page }`)

            // temp
            this.$auth.getIdTokenClaims().then(result => {
                this.token = result.__raw;

                this.axios
                    .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                    .get(process.env.VUE_APP_API + `/FuneralHomes?pageSize=${itemsPerPage}&pageNumber=${page - 1}&sortBy=${this.sortBy}&sortAsc=${this.sortAsc}&search=${this.search.toString().toLowerCase()}`)
                    .then(response => {
                        console.log(response.data)
                        this.homes = response.data.homes;
                        this.totalHomes = response.data.total;
                        this.loading = false; 
                    })
                    .catch(error => {
                        console.log(error)
                        this.loading = false; 
                        this.errorLoading = true;
                    })
            })
        },
        getUsers(item) { 
            this.$refs.usersTable.openDialog = true;
            this.$refs.usersTable.getUsers(item.id);
        },
        watchSearch() {
            if (this.search.length === 0) {
                this.getHomes()
            } 
        },
        deleteHome() {
            this.deleteMessage = '';
            this.axios
                .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                .delete(process.env.VUE_APP_API + `/FuneralHomes/${this.selectedId}`)
                .then(result => {
                    this.message = `${this.homes[this.selectedIndex].name} was deleted`;
                    this.homes.splice(this.selectedIndex, 1)
                })
                .catch(error => {
                    console.log(error)
                    this.message = `Error deleting ${this.homes[this.selectedIndex].name}. Please try again`
                })
                .then(() => {
                    this.snackbar = true;
                })

            this.deleteModal = false;
        },
        editHome(id) {
            this.$router.push({ path: `/manage-homes/${id}` }) 
        },
        impersonate(id) {
            this.loading = true;
            this.axios
                .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                .post(process.env.VUE_APP_API + `/superadmin/impersonate?funeralHomeId=${ id }&impersonate=true`)
                .then(response => {
                    this.$router.push({ name: 'Services'}) 
                    this.$router.go(0);
                })
        },
        updateBilling(item) {
            this.$refs.billingModal.home = item;
            this.$refs.billingModal.openDialog()
        },
        updateSettings(item) {
            this.$refs.homeSettingsModal.home = item;
            this.$refs.homeSettingsModal.openDialog()
        },
        goToSettings(id) {
            this.$router.push({ path: `/admin-settings/${id}` }) 
        },
        setSnackBar(message) {
            this.message = message;
            this.snackbar = true;
        }
    },
}
</script>

<style lang="scss" scoped>
    .dev-home-border {
        background: #FF530D;
        position: absolute;
        left: -.75rem;
        top: 50%;
        transform: translateY(-50%);
        height: 90%;
        width: .4rem;
        border-radius: 5px;
    }
</style>
