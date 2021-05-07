<template>
    <div>
        <side-nav></side-nav>
        <div v-bind:class="[{ 'menu-showing': this.$store.state.menuShowing }, 'dash-container']">
            <div class=text-right>
                <router-link :to="{ name: 'ManageUsers' }" class="btn btn-primary"><user-plus-icon class="mr-2" size="1.25x"></user-plus-icon> Create New User</router-link>
            </div>
            
             <v-card>
                    <v-card-title>
                      <users-icon size="1.25x" class="mb-1 mr-2"></users-icon> <h4>Users</h4>
                    <v-spacer></v-spacer>
                    <!-- <v-text-field
                        v-if="users.length"
                        v-model="search"
                        append-icon="mdi-magnify"
                        label="Search"
                        single-line
                        hide-details
                    ></v-text-field> -->
                    </v-card-title>
                    <div class="w-50 pa-4">
                        <v-autocomplete v-model="funeralHome" @change="handleFuneralHomeChange" :items="homes" label="Select A Funeral Home" item-text="name" item-value="id"></v-autocomplete>
                    </div>

                    <v-data-table
                        :headers="headers"
                        :items="users"
                        :loading="loading"
                        loading-text="Getting Users..."
                        :search="search">

                        <template v-slot:no-data>
                            {{ noUsers ? 'No Users Found' : 'Select a Funeral Home to view it\'s users' }}
                        </template>

                        <template v-slot:item.name="{ item }">
                            {{ item.firstName + ' ' + item.lastName }}
                        </template>  

                        <template v-slot:item.email="{ item }">
                            <a :href="`mailto:${item.email}`">{{ item.email }}</a>
                        </template> 

                        <template v-slot:item.primaryContactPhone="{ item }">
                            <a :href="`tel:${item.primaryContactPhone}`">{{ item.primaryContactPhone }}</a>
                        </template> 

                        <template v-slot:item.actions="{ item }">
                            <div class="action-list">
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on, attrs }">
                                        <span v-bind="attrs" v-on="on">
                                            <edit-2-icon @click="editUser(item.id)" size="1.25x"></edit-2-icon>
                                        </span>
                                    </template>

                                    <span>Edit</span>
                                </v-tooltip>

                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on, attrs }">
                                        <span v-bind="attrs" v-on="on">
                                            <lock-icon size="1.25x"></lock-icon>
                                        </span>
                                    </template>

                                    <span>Password</span>
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
                                    persistent
                                    max-width="290">

                                    <v-card>
                                        <v-card-title class="headline">
                                        Delete Owner?
                                        </v-card-title>
                                        <v-card-text>Are you sure you want to delete {{ selectedUser.firstName + ' ' + selectedUser.lastName }}?</v-card-text>
                                        <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn
                                            color="gdarken-1"
                                            text
                                            @click="deleteModal = false"
                                        >
                                            cancel
                                        </v-btn>
                                        <v-btn
                                            color="red darken-1"
                                            text
                                            @click="deleteUser()"
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
        </div>

        <v-snackbar v-model="snackbar" :timeout="2000">
            {{ message }} 
        </v-snackbar>
    </div>
</template>

<script>
import { UsersIcon, Edit2Icon, LockIcon, Trash2Icon, MailIcon, UserPlusIcon } from 'vue-feather-icons'

export default {
    metaInfo: {
      title: 'Users',
    },
    data() {
        return {
            homes: [],
            snackbar: false,
            search: '',
            message: '',
            deleteModal: false,
            loading: false,
            errorLoading: false,
            selectedIndex: 0,
            funeralHome: {},
            noUsers: false,
            selectedUser: {},
            token: '',
            headers: [
                { text: 'Name', value: 'name' },
                { text: 'Email', value: 'email' },
                { text: 'Phone', value: 'primaryContactPhone' },
                { text: 'Actions', value: 'actions', width: '15%' },
            ],
            users: []
        }
    },
    components: {
        UsersIcon,
        Edit2Icon,
        LockIcon,
        Trash2Icon,
        MailIcon,
        UserPlusIcon
    },
    mounted() {
        this.getHomes();
        if (this.$route.params.id) {
            this.funeralHome = +this.$route.params.id;
            this.handleFuneralHomeChange();
        }
    },
    methods: {
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
        getUsers() {
            this.noUsers = false;
            if (this.$auth.role === 'SuperAdmin') {
                this.$auth.getIdTokenClaims().then(result => {
                    this.axios
                        .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                        .get(process.env.VUE_APP_API + `/Users?funeralHomeId=${ this.funeralHome }`)
                        .then(response => {
                            if (response.data) {
                                this.users = response.data;

                                if (!this.users.length) this.noUsers = true;
                                this.loading = false; 
                            }
                        })
                        .catch(error => {
                            console.log(error)
                            this.loading = false; 
                            this.errorLoading = true;
                        })
                });
            }
        },
        handleFuneralHomeChange() {
            this.getUsers();
        },
        openDeleteModal(item) {
            this.selectedUser = item;
            this.selectedIndex = this.users.indexOf(item)
            this.deleteModal = true;
        },
        deleteUser() {
            this.axios
                .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                .delete(process.env.VUE_APP_API + `/Users/${ this.selectedUser.id }`)
                .then(response => {
                    this.message = `${ this.selectedUser.firstName } ${ this.selectedUser.lastName } deleted!`
                    this.getUsers();
                })
                .catch(error => {
                    this.message = `Error deleting user ${ this.selectedUser.firstName } ${ this.selectedUser.lastName }`
                    console.log(error)
                })
                .then(() => {
                    this.deleteModal = false;
                    this.snackbar = true;
                })
        },
        editUser(id) {
            this.$router.push({ path: `/manage-users/edit/${id}` }) 
        }
    },
}
</script>

<style lang="scss" scoped>
    .dash-container {
        background: url('https://d1pnnwteuly8z3.cloudfront.net/images/1fde3b9d-4dc8-422c-8e23-bbe443fd0870/f9ae4de7-3055-49e2-885e-92405c900525.svg') no-repeat 0 10%;
    }

    // .table {
    //     thead{
    //         background: #f6f9fc;
    //         color: #8898aa;
    //         text-transform: uppercase;
    //         font-size: .75rem;
    //         border-top: none;
    //         letter-spacing: 1px;
    //     }
    // }
</style>