<template>
  <v-row justify="center">
    <v-dialog v-model="openDialog" max-width="60vw">
      <v-card>
        <v-card-title>
          <span class="headline"><users-icon size="1.25x" class="mb-1 mr-2"></users-icon> Manage Users</span>
          <v-spacer></v-spacer>
          <v-btn v-if="!editingUser" @click="updateUser()" color="primary">+ Add New user</v-btn>
        </v-card-title>
        <v-card-text>
          <v-container>
              <v-text-field
                    v-if="!editingUser"
                    class="w-50 mb-4 ml-auto"
                    v-model="search"
                    append-icon="mdi-magnify"
                    label="Search"
                    single-line
                    hide-details
                ></v-text-field>

            <v-data-table
                v-if="!editingUser"
                :headers="headers"
                :items="users"
                :loading="loading"
                loading-text="Getting Users...">

                <template v-slot:item.name="{ item }">
                    <p class="mb-0">{{ item.firstName + ' ' + item.lastName }}</p>
                    <small v-if="!item.emailVerified" style="opacity: .7;">Pending</small>
                </template>  

                <template v-slot:item.email="{ item }">
                    <a :href="`mailto:${item.email}`">{{ item.email }}</a>
                </template> 

                <template v-slot:item.actions="{ item }">
                    <div class="action-list">
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <span v-bind="attrs" v-on="on">
                                    <edit-2-icon @click="updateUser(item)" size="1.25x" class="icon"></edit-2-icon>
                                </span>
                            </template>

                            <span>Edit</span>
                        </v-tooltip>

                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <span v-bind="attrs" v-on="on">
                                    <lock-icon size="1.25x" class="icon"></lock-icon>
                                </span>
                            </template>

                            <span>Password</span>
                        </v-tooltip>

                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <span v-bind="attrs" v-on="on" @click="openDeleteModal(item)">
                                    <trash-2-icon size="1.25x" class="icon"></trash-2-icon>
                                </span>
                            </template>

                            <span>Delete</span>
                        </v-tooltip>

                        <v-dialog
                            v-model="deleteModal"
                            persistent
                            max-width="290">

                            <v-card v-if="selectedUser">
                                <v-card-title class="headline">
                                Delete Users?
                                </v-card-title>
                                <v-card-text>Are you sure you want to delete {{ selectedUser.firstName + ' ' + selectedUser.lastName }}?</v-card-text>
                                <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="gdarken-1" text @click="deleteModal = false">
                                    cancel
                                </v-btn>
                                <v-btn color="red darken-1" text @click="deleteUser()">
                                    Delete
                                </v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </div>
                </template>

            </v-data-table>

            <div v-else>
                <v-form class="form-container" ref="form" lazy-validation>
                    <v-row>
                        <v-col>
                            <v-text-field v-model="userForm.firstName" label="First Name" :rules="[v => !!v || 'First name is required']"></v-text-field>
                        </v-col>
                        <v-col>
                             <v-text-field v-model="userForm.lastName" label="Last Name" :rules="[v => !!v || 'Last name is required']"></v-text-field>
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col>
                            <v-text-field :disabled="updatingUser" v-model="userForm.email" type="email" label="Email" :rules="[v => !!v || 'Email is required']"></v-text-field>
                        </v-col>
                        <v-col>
                        </v-col>
                    </v-row>

                    <v-alert v-if="errorMessage.length" type="error">
                        {{ errorMessage }}
                    </v-alert>

                    <div class="mt-4">
                        <v-btn @click.prevent="createUser()" color="primary">{{ updatingUser ? 'Update User' : 'Create User' }}</v-btn>
                        <v-btn @click="cancelUserForm()" text class="ml-4">cancel</v-btn>
                    </div>
                </v-form>
            </div>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="openDialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :timeout="2000">
        {{ message }} 
    </v-snackbar>
  </v-row>
</template>

<script>
import { UsersIcon, MailIcon, Edit2Icon, Trash2Icon, LockIcon } from 'vue-feather-icons';

  export default {
    data: () => ({
        token: '',
        users: [],
        snackbar: false,
        message: '',
        openDialog: false,
        loading: false,
        errorLoading: false,
        deleteModal: false,
        selectedUser: {},
        search: '',
        editingUser: false,
        updatingUser: false,
        errorMessage: '',
        userId: -1,
        userForm: {
            firstName: '',
            lastName: '',
            email: '',
        },
        id: -1,
        headers: [
                { text: 'Name', value: 'name', width: '30%' },
                { text: 'Email', value: 'email' },
                { text: 'Actions', value: 'actions', width: '20%', align: 'center' },
            ],
    }),
    methods: {
        getUsers(id = this.$auth.funeralHomeId) {
            this.id = id;
            this.users = [];
            this.loading = true;
            this.$auth.getIdTokenClaims().then(result => {
                this.token = result.__raw;

                this.axios
                    .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                    .get(process.env.VUE_APP_API + `/Users?funeralHomeId=${ id }`)
                    .then(response => {
                        if (response.data) {
                            console.log(response.data)
                            this.users = response.data;
                        }
                    })
                    .catch(error => {
                        console.log(error)
                        this.errorLoading = true;
                    }).then(() => {
                        this.loading = false;
                    })
            });
        },
        updateUser(item = null) {
            this.updatingUser = false;
            this.editingUser = true;

            if (item) {
                this.updatingUser = true;
                this.userId = item.id;
                this.userForm.firstName = item.firstName;
                this.userForm.lastName = item.lastName;
                this.userForm.email = item.email;
            }
            
        },
        createUser() {
            this.errorMessage = '';

            if (this.updatingUser) {
                let data = {
                    firstName: this.userForm.firstName,
                    lastName: this.userForm.lastName,
                    id: this.userId
                }

                  this.axios
                    .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                    .put(process.env.VUE_APP_API + '/users/', data)
                    .then(response => {
                        this.message = 'User Updated';
                        this.cancelUserForm();
                        this.getUsers(this.id)
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
                    firstName: this.userForm.firstName,
                    lastName: this.userForm.lastName,
                    email: this.userForm.email,
                    funeralHomeId: this.id
                }

                this.axios
                    .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                    .post(process.env.VUE_APP_API + '/users/invite', data)
                    .then(response => {
                        this.message = 'User created';
                        this.cancelUserForm();
                        this.getUsers(this.id)
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
        cancelUserForm() {
            this.editingUser = false;
            this.updatingUser = false;

            this.userForm.firstName = '';
            this.userForm.lastName = '';
            this.userForm.email = '';
            this.userId = -1;
        },
        resendEmailInvite(user) {
            if (user.emailVerified) {
                this.snackbar = true;
                this.message = `${user.email} has already verified their email address`;
                return;
            }

            this.axios
                .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                .post(process.env.VUE_APP_API + '/users/resend', {
                    id: user.id
                })
                .then(response => {
                    if (response.data) {
                        this.snackbar = true;
                        this.message = `Invite resent to ${user.email}`
                    }
                })
                .catch(error => {
                    this.snackbar = true;
                    this.message = `Error sending to ${user.email}`
                })
        },
        openDeleteModal(item) {
            this.selectedUser = item;
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
    },
    components: {
        UsersIcon,
        MailIcon,
        Edit2Icon,
        Trash2Icon,
        LockIcon
    }
  }
</script>

<style lang="scss" scoped>
    .icon {
        margin: 0 .5rem;
    }
</style>