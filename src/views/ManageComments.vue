<template>
    <div>
        <side-nav></side-nav>
        <div v-bind:class="[{ 'menu-showing': this.$store.state.menuShowing }, 'dash-container']">
            <div class="text-right" style="margin-right: 12%">
                <v-btn @click="$router.go(-1)">back</v-btn>
            </div>
            <div class="tile elevation-6 mt-8">
                <div class="header">
                    <h4><file-text-icon class="mr-1 mb-1"></file-text-icon> Manage Comments</h4>
                </div>

                 <v-data-table
                    :headers="headers"
                    :items="comments"
                    :loading="loading"
                    loading-text="Getting Comments..."
                    class="elevation-1">

                    <template v-slot:item.content="{ item }">
                       <div class="pt-2 pb-2">
                            {{ item.content }}
                       </div>
                    </template>

                    <template v-slot:item.status="{ item }">
                       <div @click="openCommentStatus(item)">
                            <v-chip v-if="item.status === 2" class="ma-2">{{ commentStatus[item.status] }}</v-chip>
                            <v-chip v-if="item.status === 1" color="orange" text-color="white">{{ commentStatus[item.status] }}</v-chip>
                            <v-chip v-if="item.status === 0" color="red" text-color="white">{{ commentStatus[item.status] }}</v-chip>
                       </div>
                    </template>

                    <template v-slot:item.actions="{ item }">
                        <div class="text-center">
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <span v-bind="attrs" v-on="on" @click="openDeleteModal(item)">
                                        <trash-2-icon size="1.25x"></trash-2-icon>
                                    </span>
                                </template>

                                <span>Delete</span>
                            </v-tooltip>
                        </div>

                    </template>
                 
                 </v-data-table>
            </div>

            <v-dialog v-model="deleteDialog" max-width="290">
                <v-card>
                    <v-card-title class="headline">Delete Comment</v-card-title>
                    <v-card-text v-if="!busy">
                        Are you sure you want to delete comment from {{ selectedComment.name }}
                    </v-card-text>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn :disabled="busy" text @click="deleteDialog = false">cancel</v-btn>
                        <v-btn @click="deleteComment" color="primary" :loading="busy" :disabled="busy" text>Confirm</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <v-dialog v-model="commentDialog" max-width="290">
                <v-card>
                    <v-card-title class="headline">Manage Comment</v-card-title>
                    <v-card-text v-if="!busy">
                        Please selected how you would like to mark this message:

                        <v-radio-group v-model="selectedStatus" class="status-selection">
                            <v-radio value="2" label="Clean"></v-radio>
                            <v-radio value="1" label="Questionable" color="orange"></v-radio>
                            <v-radio value="0" label="Blocked" color="red"></v-radio>
                        </v-radio-group>  
                    </v-card-text>

                    <div v-else class="mt-10 mb-10 text-center">
                        <v-progress-circular :size="64" color="#FF530D" indeterminate class="spinner"></v-progress-circular>
                    </div>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn :disabled="busy" text @click="commentDialog = false">cancel</v-btn>
                        <v-btn color="primary" :loading="busy" :disabled="busy" text @click="moderate">Confirm</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </div>

        <v-snackbar v-model="snackbar" :timeout="3000">
            {{ message }}
        </v-snackbar>
    </div>
</template>

<script>
import { Trash2Icon, FileTextIcon } from 'vue-feather-icons'

export default {
    metaInfo: {
      title: 'Manage Comments',
    },
    data() {
        return {
            token: '',
            comments: [],
            loading: true,
            headers: [
                { text: 'Name', value: 'name' },
                { text: 'Comment', value: 'content' },
                { text: 'Status', value: 'status' },
                { text: 'Actions', value: 'actions' },
            ],
            commentStatus: ['Blocked', 'Questionable', 'Clean'],
            commentDialog: false,
            deleteDialog: false,
            selectedComment: {},
            selectedStatus: 0,
            busy: false,
            snackbar: false,
            message: ''
        }
    },
    mounted() {
        this.getComments()
    },
    methods: {
        getComments() {
            this.$auth.getIdTokenClaims().then(result => {
                this.token = result.__raw;

                this.axios
                    .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                    .post(process.env.VUE_APP_API  + `/comments/getall/${ this.$route.params.id }`)
                    .then(response => {
                        this.comments = response.data;
                        console.log(response)
                    })
                    .catch(error => {
                        console.log(error)
                    })
                    .then(() => {
                        this.loading = false;
                    })
            });
        },
        openDeleteModal(item) {
            this.selectedComment = item;
            this.deleteDialog = true;
        },
        openCommentStatus(item) {
            this.selectedComment = item;
            this.selectedStatus = this.selectedComment.status.toString();
            this.commentDialog = true;
        },
        moderate() {
        // set new status
        this.selectedComment.status = +this.selectedStatus;
        this.busy = true;

        this.axios
          .create({ headers: {'Authorization': `Bearer ${this.token}`} })
          .post(process.env.VUE_APP_API  + `/comments/moderate`, this.selectedComment)
          .then(response => {
            console.log(response)
          })
          .catch(error => {
            console.log(error)
          })
          .then(() => {
            this.busy = false;
            this.commentDialog = false;
          })
      },
      deleteComment() {
          console.log('deleting message ' + this.selectedComment.id)
          this.axios
            .create({ headers: {'Authorization': `Bearer ${this.token}`} })
            .delete(process.env.VUE_APP_API  + `/comments/${ this.selectedComment.id }`)
            .then(response => {
                this.message = 'Comment deleted';
                this.deleteDialog = false;
                this.getComments();
            })
            .catch(error => {
                console.log(error)
                this.message = 'Error deleting comment'
            })
            .then(() => {
                this.snackbar = true;
            })
      }
    },
    components: {
        Trash2Icon,
        FileTextIcon
    }
}
</script>

<style lang="scss" scoped>
.dash-container {
        background: url('https://d1pnnwteuly8z3.cloudfront.net/images/1fde3b9d-4dc8-422c-8e23-bbe443fd0870/3db295f3-24bb-4347-8d2e-c58abfeb92aa.svg') no-repeat fixed 0 -18rem;
    }

    .tile {
        width: 70%;
        margin: 4rem auto 10%;
        padding: 2rem inherit;
    }
</style> 