<template>
    <div>
        <side-nav></side-nav>
        <div v-bind:class="[{ 'menu-showing': this.$store.state.menuShowing }, 'dash-container']">
            <v-card-title>
                <h2 class="text-light d-inline-block"><archive-icon size="1.5x" class="mr-4"></archive-icon> Services </h2>
                <v-spacer></v-spacer>
                    <router-link v-if="$auth.role !== 'SuperAdmin'" :to="{ name: 'ManageServices' }" class="btn btn-primary mr-auto"><span>+</span> Create New Service</router-link>
            </v-card-title>

            <v-card>
                <div class="text-right">
                    <v-text-field
                        v-model="search"
                        append-icon="mdi-magnify"
                        @click:append="filter"
                        label="Search"
                        single-line
                        hide-details
                        @input="watchSearch"
                        v-on:keyup.enter="filter"
                        class="search-bar"
                    ></v-text-field>
                </div>

                <h2 v-if="searchFilter" class="pl-6">Search results for: {{ searchString }}</h2>

                <v-data-table
                    :headers="headers"
                    :items="services"
                    :loading="loading"
                    :options.sync="options"
                    :server-items-length="totalServices"
                    loading-text="Getting Services..."
                    @click:row="editService"
                    class="elevation-1">

                    <template v-slot:item.created="{ item }">
                        <div class="position-relative">
                            <span style="font-size: .8rem; opacity: .7">{{ item.createDate | moment('l') }}</span>

                               <div v-if="item.test" style="line-height: .9rem">
                                <small style="color: #2275d7">Test Service</small>
                                <div class="test-service-border"></div>
                            </div>
                        </div>
                    </template> 

                    <template v-slot:item.name="{ item }">  
                        <span>{{ item.firstName + ' ' + item.lastName }}</span>
                    </template> 

                    <template v-slot:item.serviceState="{ item }">
                        {{ serviceStates[item.serviceState] }}
                    </template> 

                        <template v-slot:item.actions="{ item }">
                            <div class="action-list text-center">
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on, attrs }">
                                        <span v-bind="attrs" v-on="on">
                                            <play-icon @click="playService(item.slug)" size="1.25x"></play-icon>
                                        </span>
                                    </template>

                                    <span>Play video</span>
                                </v-tooltip>

                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on, attrs }">
                                        <span v-bind="attrs" v-on="on">
                                            <edit-2-icon @click="editService(item)"  size="1.25x"></edit-2-icon>
                                        </span>
                                    </template>

                                    <span>Edit Service</span>
                                </v-tooltip>

                                 <v-tooltip bottom>
                                    <template v-slot:activator="{ on, attrs }">
                                        <span v-bind="attrs" v-on="on">
                                            <bar-chart-icon @click="viewServiceAnalytics(item.id)" size="1.25x"></bar-chart-icon>
                                        </span>
                                    </template>

                                    <span>View Analylics</span>
                                </v-tooltip>

                                 <!-- <v-tooltip bottom>
                                    <template v-slot:activator="{ on, attrs }">
                                        <span v-bind="attrs" v-on="on">
                                            <file-text-icon @click="viewComments(item.slug)" size="1.25x"></file-text-icon>
                                        </span>
                                    </template>

                                    <span>Manage Comments</span>
                                </v-tooltip> -->

                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on, attrs }">
                                        <span v-bind="attrs" v-on="on">
                                            <trash-2-icon @click.stop="openDeleteModal(item)" size="1.25x"></trash-2-icon>
                                        </span>
                                    </template>

                                    <span>Delete</span>
                                </v-tooltip>

                                <v-dialog
                                    v-model="deleteModal"
                                    :retain-focus="false"
                                    max-width="290">

                                    <v-card>
                                        <v-card-title class="headline">
                                        Delete Service?
                                        </v-card-title>
                                        <v-card-text>{{ deleteMessage }}?</v-card-text>
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
                                            @click="deleteService()"
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

            <v-snackbar v-model="errorLoading">
                Error getting data

                <template v-slot:action="{ attrs }">
                    <v-btn color="red" text v-bind="attrs" @click="getServices()">
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
import { Edit2Icon, Trash2Icon, UploadIcon, DownloadIcon, PlayIcon, ArchiveIcon, BarChartIcon, FileTextIcon } from 'vue-feather-icons'

export default {
    metaInfo: {
      title: 'Services',
    },
    data() {
        return {
            snackbar: false,
            message: '',
            deleteModal: false,
            selectedIndex: 0,
            selectedId: -1,
            loading: false,
            errorLoading: false,
            totalServices: 0,
            searchString: '',
            sortBy: 'CreateDate',
            sortAsc: false,
            options: {},
            search: '',
            searchFilter: false,
            headers: [
                { text: 'Created', value: 'created' },
                { text: 'Name', value: 'name' },
                { text: 'Created By', value: 'creatorEmail' },
                { text: 'Private', value: 'private' },
                { text: 'Total Cost', value: 'totalCost' },
                { text: 'Total Views', value: 'totalViews' },
                { text: 'State', value: 'serviceState' },
                { text: 'Actions', value: 'actions', sortable: false, width: '25%', align: 'center' },
                // { text: '', value: 'data-table-expand', width: '10%' }
            ],
            services: [],
            serviceStates: ['Created', 'Coming Up', 'Live', 'InBetween', 'Finished', 'Completed'],
            token: '',
            deleteMessage: ''
        }
    },
    components: {
        Edit2Icon,
        Trash2Icon,
        UploadIcon,
        DownloadIcon,
        PlayIcon,
        ArchiveIcon,
        BarChartIcon,
        FileTextIcon
    },
    watch: {
        options: {
            handler() {
                this.getServices();
            },
        },
        deep: true,
    },
    methods: {
        getServices() {  
            const { sortBy, sortDesc, page, itemsPerPage } = this.options
            this.loading = true; 
            this.errorLoading = false;

            let query = `/Services?pageSize=${itemsPerPage}&pageNumber=${page - 1}&sortBy=${this.sortBy}&sortAsc=${this.sortAsc}&search=${this.search.toString().toLowerCase()}`
            if (this.$auth.role === 'SuperAdmin') {
                query = `/Services/get-admin?pageSize=${itemsPerPage}&pageNumber=${page - 1}&sortBy=${this.sortBy}&sortAsc=${this.sortAsc}&search=${this.search.toString().toLowerCase()}`
            }

            this.$auth.getIdTokenClaims().then(result => {
                this.token = result.__raw;

                this.axios
                .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                .get(process.env.VUE_APP_API + query)
                .then(response => {
                    if (response.data) {
                        this.services = response.data.services;
                        this.totalServices = response.data.total

                        if (this.$auth.role === 'SuperAdmin') {
                              this.services.forEach((item, idx) => {
                                if (item.funeralHome) this.getFuneralHomeNameById(item.funeralHomeId, idx);
                            })
                        }

                        this.loading = false; 
                    }
                })
                .catch(error => {
                    this.loading = false; 
                    this.errorLoading = true;
                })
            })
        },
        filter() {
            this.getServices()
            this.searchFilter = true;
            this.searchString = this.search;
        },
        watchSearch() {
            if (this.search.length === 0) {
                this.getServices()
                this.searchFilter = false;
            } 
        },
        getFuneralHomeNameById(id, idx) {
            this.axios
            .create({ headers: {'Authorization': `Bearer ${this.token}`} })
            .get(process.env.VUE_APP_API + `/FuneralHomes/${id}`)
            .then(result => {
                if (result) {
                    this.$set(this.services[idx], 'home', result.data.name)
                }
            }).catch(err => console.log(`error getting name for home ${id}`))
        },
        openDeleteModal(item) {
            this.deleteMessage = `Are you sure you want to delete the service for ${item.firstName} ${item.lastName}`;
            this.selectedIndex = this.services.indexOf(item)
            this.deleteModal = true;
            this.selectedId = item.id;
        },
        deleteService(item) {
            this.axios
                .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                .delete(process.env.VUE_APP_API `/Services/${this.selectedId}`)
                .then(result => {
                    this.deleteMessage = '';
                    this.deleteModal = false;
                    this.message = `Service for ${this.services[this.selectedIndex].firstName} ${this.services[this.selectedIndex].lastName} was deleted`;
                    this.services.splice(this.selectedIndex, 1)
                    this.snackbar = true;
                })
                .catch(error => {
                    console.log(error)
                    this.message = `Error deleting ${this.services[this.selectedIndex].firstName} ${this.services[this.selectedIndex].lastName}. Please try again`
                    this.snackbar = true;
                })
        },
        playService(slug) {
            this.$router.push({ path: `/services/view/${slug}` }) 
        },
        editService(item) {
            this.$router.push({ path: `/manage-services/${item.id}` }) 
        },
        viewServiceAnalytics(id) {
            this.$router.push({ path: `/analytics/${id}` }) 
        },
        viewComments(id) {
            this.$router.push({ path: `/manage-services/comments/${id}` }) 
        }
    },
      mounted() {
        if (this.$auth.role === 'SuperAdmin') this.headers.unshift({ text: 'Home', value: 'home', align: 'start' })
        this.getServices();
    }
}
</script>

<style lang="scss" scoped>
.dash-container {
    background: url('https://d1pnnwteuly8z3.cloudfront.net/images/1fde3b9d-4dc8-422c-8e23-bbe443fd0870/3db295f3-24bb-4347-8d2e-c58abfeb92aa.svg') no-repeat fixed 0 -18rem;
}

.v-card__title {
    align-items: center;
}

.search-bar {
    display: inline-block;
    width: 30%;
    margin: 1rem 2rem;
}

.v-data-table {
    margin-bottom: 8rem;
    padding-bottom: 4rem;
}

.test-service-border {
        background: #2275d7;
        position: absolute;
        left: -.7rem;
        top: 50%;
        transform: translateY(-50%);
        height: 90%;
        width: .2rem;
        border-radius: 5px;
    }
</style>