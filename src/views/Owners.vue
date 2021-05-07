<template>
    <div>
        <side-nav></side-nav>
        <div v-bind:class="[{ 'menu-showing': this.$store.state.menuShowing }, 'dash-container']">
            <div class=text-right>
                <v-btn @click="createOrEditModal = true"><user-plus-icon class="mr-2" size="1.25x"></user-plus-icon> Create New Owner</v-btn>
            </div>

            <v-card>
                  <v-card-title>
                      <h4>Owners</h4>
                  </v-card-title>

                    <v-data-table
                        :headers="headers"
                        :items="owners"
                        :loading="loading"
                        loading-text="Getting Owners..."
                        :search="search">

                <template v-slot:item.actions="{ item }">
                    <div class="action-list">
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <span v-bind="attrs" v-on="on">
                                    <edit-2-icon @click="edit(item)" size="1.25x"></edit-2-icon>
                                </span>
                            </template>

                            <span>Edit</span>
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
                                    <v-card-text v-if="selectedOwner">Are you sure you want to delete {{ selectedOwner.name }}?</v-card-text>
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
                                        @click="deleteOwner()"
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

             <v-dialog v-model="createOrEditModal" persistent max-width="720">
                <v-card>
                    <v-card-title class="headline">
                        {{ editing ? 'Edit Owner' : 'Create Owner' }}
                    </v-card-title>
                        <div>
                            <v-form class="form-container pt-0 pb-0 pl-8 pr-8" ref="form" lazy-validation>
                                <v-text-field v-model="form.name" label="Name" :rules="[v => !!v || 'Name is required']"></v-text-field>

                                <v-row class="mt-0">
                                    <v-col>
                                        <v-text-field v-model="form.address1" label="Address 1"></v-text-field>
                                    </v-col>
                                    
                                    <v-col>
                                        <v-text-field v-model="form.address2" label="Address 2"></v-text-field>
                                    </v-col>
                                </v-row>

                                <v-row class="mt-0">
                                    <v-col>
                                        <v-text-field v-model="form.city" label="City"></v-text-field>
                                    </v-col>
                                    
                                    <v-col>
                                        <v-text-field v-model="form.state" label="State"></v-text-field>
                                    </v-col>

                                    <v-col>
                                        <v-text-field v-model="form.zipCode" label="Zip"></v-text-field>
                                    </v-col>
                                </v-row>

                                <v-row class="mt-0">
                                    <v-col>
                                        <v-text-field v-model="form.email" label="Email"></v-text-field>
                                    </v-col>
                                    
                                    <v-col>
                                        <v-text-field v-model="form.primaryContactEmail" label="Primary Contact Email"></v-text-field>
                                    </v-col>
                                </v-row>

                                <v-row class="mt-0">
                                    <v-col>
                                        <v-text-field v-model="form.primaryContact" label="Primary Contact"></v-text-field>
                                    </v-col>
                                    
                                    <v-col>
                                        <v-text-field v-model="form.primaryContactPhoneNumber" label="Primary Contact Phone Number"></v-text-field>
                                    </v-col>
                                </v-row>
                            </v-form>
                        </div>
                    <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="gdarken-1" text @click="createOrEditModal = false">
                        cancel
                    </v-btn>
                    <v-btn color="blue darken-1" text @click="editing ? save() : editOwner()">
                        Save
                    </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </div>
    </div>
</template>

<script>
import { Edit2Icon, Trash2Icon, UserPlusIcon } from 'vue-feather-icons'

export default {
    metaInfo: {
      title: 'Owners',
    },
    data() {
        return {
            token: '',
            owners: [],
            loading: true,
            search: '',
            selectedOwner: null,
            selectedIndex: -1,
            editing: false,
            createOrEditModal: false,
            deleteModal: false,
            form: {
                name: '',
                address1: '',
                address2: '',
                city: '',
                state: '',
                zipCode: '' ,
                email: '',
                primaryContact: '',
                primaryContactPhoneNumber: '',
                primaryContactEmail: ''
            },
            headers: [
                {text: 'Id', value: 'id'},
                {text: 'Name', value: 'name'},
                {text: 'City', value: 'city'},
                {text: 'State', value: 'state'},
                {text: 'Actions', value: 'actions', width: '10%'},
            ]
        }
    },
    mounted() {
        if (this.$auth.role === 'SuperAdmin') {
            this.$auth.getIdTokenClaims().then(result => {
                this.token = result.__raw;

                this.getOwners()
            });
        }
    },
    methods: {
        getOwners() {
            this.loading = true;
            this.axios
                .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                .get(process.env.VUE_APP_API + `/Owners`)
                .then(response => {
                    console.log(response)
                    if (response.data) {
                        this.owners = response.data;
                    }
                })
                .catch(error => {
                    console.log(error)
                    // this.errorLoading = true;
                })
                .then(() => {
                    this.loading = false;
                })
        },
         openDeleteModal(item) {
            this.selectedOwner = item;
            this.selectedIndex = this.owners.indexOf(item)
            this.deleteModal = true;
        },
        deleteOwner() {
            this.axios
                .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                .delete(process.env.VUE_APP_API + `/Owners/${ this.selectedOwner.id }`)
                .then(response => {
                    this.message = `${ this.selectedOwner.name }deleted!`
                    this.getOwners();
                })
                .catch(error => {
                    this.message = `Error deleting owner`
                    console.log(error)
                })
                .then(() => {
                    this.deleteModal = false;
                    this.snackbar = true;
                })
        },
        save() {
            this.axios
                .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                .post(process.env.VUE_APP_API + `/Owners`, this.form)
                .then(response => {
                    console.log(response)
                    this.createOrEditModal = false
                    this.message = 'Owner created';
                    this.getOwners();
                })
                .catch(error => {
                    console.log(error)
                    this.message = 'Error creating owner';
                })
                .then(() => {
                    this.snackbar = true;
                })
        },
        editOwner() {
             this.axios
                .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                .put(process.env.VUE_APP_API + `/Owners/${ this.selectedOwner.id }`, this.form)
                .then(response => {
                    this.createOrEditModal = false
                    this.message = 'Owner edited';
                    this.getOwners();
                })
                .catch(error => {
                    console.log(error)
                    this.message = 'Error editing owner';
                })
                .then(() => {
                    this.snackbar = true;
                })
        },
        edit(item) {
            this.selectedOwner = item;
            this.editing = true;
            this.createOrEditModal = true;

            this.form = this.selectedOwner;
        }
    },
    components: {
        Edit2Icon,
        Trash2Icon,
        UserPlusIcon
    }
}
</script>