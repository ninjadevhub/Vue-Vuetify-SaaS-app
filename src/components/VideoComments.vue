<template>
<div class="container">
    <div v-if="!gettingComments" class="comment-section">
        <h4>View Comments</h4>
        <p v-if="!comments.length" class="mt-6 mb-6">- No Comments Yet</p>
        <ul class="comments-list" v-else>
            <li v-for="item in comments" :key="item.id">
              <v-row no-gutters class="mt-4">
                  <v-col cols="4" md="2" class="text-center mr-8">
                    <img v-if="item.pictureUrl" :src="item.pictureUrl" class="comment-thumbnail">
                    <avatar v-else :fullname="item.name" :size="88"></avatar>
                    <h6>{{ item.name }}</h6>
                  </v-col>

                  <v-col cols="14" md="8" class="pt-4">
                    <div class="content"><h6>{{ item.content }}</h6></div>

                    <div v-if="$auth.role === 'SuperAdmin' || $auth.role === 'FuneralHome'">
                      <v-chip v-if="item.status === 2" class="ma-2">{{ commentStatus[item.status] }}</v-chip>
                      <v-chip v-if="item.status === 1" color="orange" text-color="white">{{ commentStatus[item.status] }}</v-chip>
                      <v-chip v-if="item.status === 0" color="red" text-color="white">{{ commentStatus[item.status] }}</v-chip>

                      <v-btn v-if="item.status === 0 || item.status === 1" @click="markCommentClean(item)" rounded elevation="2" class="ml-2" small>
                        <check-circle-icon size="1.25x" class="mr-2" color="#50c878"></check-circle-icon> Mark as clean
                      </v-btn>

                      <v-btn v-else @click="markCommentBlocked(item)" rounded elevation="2" class="ml-2"  small>
                        <x-icon size="1.25x" color="red" class="mr-2"></x-icon> Block
                      </v-btn>
                    </div>
                  </v-col>
              </v-row>
            </li>
        </ul>
    </div>

    <div v-else class="getting-comments">
        <v-progress-circular :size="64" color="#FF530D" indeterminate class="spinner"></v-progress-circular>
        <p>getting comments</p>
    </div>

    <v-btn v-if="!gettingComments && !commentsReady" @click="openCommentsModal" color="#0c3c60" dark class="leave-comment-btn">Leave A Comment</v-btn>

     <v-form v-if="commentsReady" class="comment-form">
        <h4>Leave A Comment</h4>

        <v-row no-gutters class="mt-4">
            <v-col cols="4" md="1" class="text-center comment-img">
                <img v-if="commentUser.img" :src="commentUser.img" class="comment-thumbnail">
                <avatar v-else :fullname="commentUser.name" :size="24"></avatar>
                <h6>{{ commentUser.name }}</h6>
            </v-col>

            <v-col cols="14" md="8">
                <div v-if="!commentComplete">
                    <v-textarea v-model="commentFields.comment" ref="commentArea" rows="3" name="input-7-1" label="Please leave your comment here"></v-textarea>
                    <v-btn @click="postComment()" color="#0c3c60" dark class="save-comment-btn">Save Comment</v-btn>
                </div>
                <div v-else>
                    <h5>Thank you for leaving your comment. It has been added to the top of the comments list.</h5>
                </div>
            </v-col>
        </v-row>
      </v-form>

    <v-row>
      <v-dialog v-model="dialog" persistent max-width="360">
        <v-card>
          <v-card-title class="headline">
            {{ !pinMatch? 'Leave a Comment' : 'Create profile' }}
          </v-card-title>
          <v-card-text>
                <div v-if="!pinMatch">
                  <v-text-field v-model="pinInput" class="input" label="Enter PIN" maxlength="6" @input="onInput()" ref="pinInput" outlined></v-text-field>
                  <div class="text-danger text-center">{{ error }}</div>
                </div>

                <div v-else>
                  <v-form ref="form" class="text-center">
                    <div class="mt-6">
                      <v-tooltip bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <div class="preview-border" v-bind="attrs" v-on="on">
                              <img @click="$refs.file.click()" :src="require(`@/assets/images/placeholder.png`)" ref="preview" class="preview" />
                            </div>
                                <!-- <v-btn @click="$refs.file.click()" block class="mt-4"><user-icon class="mr-2"></user-icon> upload avatar</v-btn> -->
                            <input @change="onFileSelected" type="file" ref="file" accept="image/*" style="display: none">                     
                          </template>
                          <span>Change Photo</span>
                      </v-tooltip>
                    </div>

                    <small @click="$refs.file.click()">add a avatar</small>
                    
                    <v-text-field v-model="name" ref="name" class="mt-4 mb-8 w-75 m-auto" label="Enter Name" :rules="[v => !!v || 'Name is required']"></v-text-field>
                    <v-btn v-if="pinMatch" :disabled="busy" class="w-75 mt-2 mb-6" color="primary" @click="save()">Save</v-btn>
                  </v-form>
                </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="dialog = false">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>

    <v-dialog v-model="commentDialog" max-width="290">
      <v-card>
        <v-card-title class="headline">Manage Comment</v-card-title>
        <v-card-text v-if="!busy">
          {{ commentContent }}

          <v-radio-group v-if="selectedComment.status === 2" v-model="selectedStatus" class="status-selection">
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
          <v-btn color="primary" :disabled="busy" text @click="moderate">Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { UserIcon, CheckCircleIcon, XIcon } from 'vue-feather-icons';
import Avatar from 'vue-avatar-component'

export default {
  props: ['slug'],
    data() {
        return {
          commentStatus: ['Blocked', 'Questionable', 'Clean'],
          selectedComment: '',
          selectedStatus: 0,
          busy: false,
          dialog: false,
          commentDialog: false,
          commentContent: '',
          pinInput: '',
          error: '',
          pinMatch: false,
          name: '',
          selectedFile: '',
          baseImg: '',
          token: '',
          gettingComments: true,
          commentFields: {
              name: '',
              comment: ''
          },
          showCommentsDialog: false,
          commentUser: [],
          commentsReady: false,
          commentComplete: false,
          comments: [],
          blobUrl: ''
        }
    },
    mounted() {
      this.getComments();
    },
  created() {
    // this.$socket.start({
    //   log: true // Active only in development for debugging.
    // });
  },
  // Register your listener here. 
  sockets: {
  
    // Equivalent of
    // signalrHubConnection.on('someEvent', (data) => this.someActionWithData(data))
    // ReceiveMessage(data) {
    //   alert("SignalR is Working!");
    //   this.someActionWithData(data)
    // }
  },

    methods: {
      getComments() {
        this.gettingComments = true;
        this.comments = [];
          this.$auth.getIdTokenClaims().then(result => {
            this.token = result.__raw;

            this.axios
              .create({ headers: {'Authorization': `Bearer ${this.token}`} })
              .post(process.env.VUE_APP_API + `/comments/getall/${this.slug}`)
              .then(response => {
                console.log('--- comments ---')
                console.log(response) 
                if (response.data.length) {
                  // if super admin show all comments
                  if (this.$auth.role === 'SuperAdmin' || this.$auth.role === 'FuneralHome') {
                    this.comments = response.data;
                    return;
                  }

                  // else only show the 'clean' comments
                  response.data.forEach(item => {
                    if (item.status === 2) this.comments.push(item)
                  })
                }
              })
              .catch(error => {
                console.log(error)
              })
              .then(() => {
                this.gettingComments = false;
              })
          });
      },
      setCommentUser(name, img) {
          this.commentUser = {
              name: name,
              img: img
          }

          this.commentsReady = true;
          setTimeout(() => { 
              this.$refs.commentArea.focus() 
              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
          })
          
      },
      onFileSelected(event) {
        let _ = this;
        this.selectedFile = event.target.files[0];

        let reader = new FileReader();

        reader.addEventListener("load", function () {
          // convert image file to base64 string
          _.$refs.preview.src = reader.result;
          _.baseImg = reader.result;
        }, false);

        if (this.selectedFile) {
          reader.readAsDataURL(this.selectedFile);
        }
      },
      openCommentsModal() {
        this.dialog = true;
        this.pinInput = '';
        this.pinMatch = false;
        setTimeout(() => {
          this.$refs.pinInput.focus();
        })
      },
      onInput() {
        if (this.pinInput.length === 6) {
          // var x = this.pins.indexOf(this.pinInput);
          // console.log(x)

          if (this.pinInput === '123123') {
            this.pinMatch = true;
            setTimeout(() => {
              this.$refs.name.focus();
            })
          } else {
            this.error = 'Invalid PIN. Please try again.'
          }
        } else {
          this.error = '';
        }
      },
      save() {
        const valid = this.$refs.form.validate();
        if (valid) {
          // save
          this.busy = true;
          this.axios
            .create({ headers: {'Authorization': `Bearer ${this.token}`} })
            .post(process.env.VUE_APP_API + `/comments/authorize`, {
              eventId: 64,
              password: '4ZTFQN',
              name: this.name
            })
            .then(response => {
              this.blobUrl = response.data;
              this.setCommentUser(this.name, this.baseImg);
              this.dialog = false;
            })
            .catch(error => {
              console.log(error)
            })
            .then(() => {
              this.busy = false
            })
        }
      },
      postComment() {
        // upload blob
        if (this.commentFields.comment.length) {
          if (this.baseImg) {
            let _ = this;
            let reader = new FileReader();
            reader.readAsArrayBuffer(this.selectedFile);
            reader.onload = function() {
            _.axios
                .create({ 
                    headers: {
                        'Content-Type': _.selectedFile.type,
                        'x-ms-blob-type': 'BlockBlob'
                    } 
                })
                .put( _.blobUrl, reader.result )
                .then(response => {
                  console.log('img uploaded')
                  console.log(response)

                  _.axios
                    .create({ headers: {'Authorization': `Bearer ${_.token}`} })
                    .post(process.env.VUE_APP_API + `/comments/post`, {
                        eventId: 64,
                        name: _.commentUser.name,
                        pictureUrl: _.blobUrl.split('?')[0],
                        content: _.$refs.commentArea.value,
                        slug: _.$route.params.slug,
                        password: '4ZTFQN'
                    })
                    .then(response => {
                        console.log(response)
                        _.commentComplete = true;
                        _.getComments();
                    })
                    .catch(error => {
                        console.log(error)
                    })
                })
              }
          } else {
            this.axios
                .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                .post(process.env.VUE_APP_API + `/comments/post`, {
                    eventId: 64,
                    name: this.commentUser.name,
                    pictureUrl: '',
                    content: this.$refs.commentArea.value,
                    slug: this.$route.params.slug,
                    password: '4ZTFQN'
                })
                .then(response => {
                    console.log(response)
                    this.commentComplete = true;
                    this.getComments();
                })
                .catch(error => {
                    console.log(error)
                })
          }
          
        } else {
          console.log('empty')
        }
      },
      markCommentClean(item) {
        this.commentDialog = true;
        this.commentContent = 'Are you sure you want to mark this message as clean?'
        this.selectedComment = item;
        this.selectedStatus = 2;  
      },
      markCommentBlocked(item) {
        this.commentDialog = true;
        this.commentContent = 'Please selected how you would like to mark this message:'
        this.selectedComment = item;
        this.selectedStatus = "0";
      },
      moderate() {
        // set new status
        this.selectedComment.status = +this.selectedStatus;
        this.busy = true;

        this.axios
          .create({ headers: {'Authorization': `Bearer ${this.token}`} })
          .post(process.env.VUE_APP_API + `/comments/moderate`, this.selectedComment)
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
    },
    components: {
      UserIcon,
      Avatar,
      XIcon,
      CheckCircleIcon
    }
}
</script>

<style lang="scss" scoped>
  .container {
   padding-top: 3rem;
  }

  .input {
    width: 70%;
    margin: 1.5rem auto -1rem !important;
  }

  .preview {
    height: 6rem;
    width: 6rem;
    border-radius: 50%;
    object-fit: cover;
  }

  .preview-border {
    margin: 3rem auto .5rem;
    height: 8rem;
    width: 8rem;
    border: .4rem solid #dadada;
    border-radius: 50%;
    line-height: 7rem;
  }

  .comment-thumbnail {
        width: 4.5rem;
        height: 4.5rem;
        border-radius: 50%;
        object-fit: cover;
        margin: .5rem auto;
    }

    .comments-list {
        padding: 0;
        margin: 0;
        list-style: none;

        li {
            padding: 1rem 0;
            background: #fafafa;
            margin: .5rem 0;
            border-radius: 5px;

            h6 {
                padding: .5rem 0;
            }
        }
    }

    .avatar {
        height: 4.5rem !important;
        width: 4.5rem !important;
        font-size: 2rem !important;
    }

    .comment-form {
        margin: 2rem 3rem;
        width: 65%;
        background: #f4f4f4;
        border-radius: 5px;
        padding: 2rem;

    }

    .comment-section {
        padding: 2rem;
    }

    .v-window-item {
        padding: 2rem 3rem;
    }

    .tab-section {
        margin: 1.5rem 0;
        padding: .5rem 2rem;
        background: #fff;
    }

    .title-callout {
        font-size: 1.3rem;
        font-weight: 600;
    }

    .leave-comment-btn {
      margin: 1rem 0 4rem 2%;
    }

    .getting-comments {
      text-align: center;
      padding: 4rem 0;
    }

    .content {
      min-height: 6rem;
    }
</style>