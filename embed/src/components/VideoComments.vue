<template>
<div class="container">
    <div v-if="!gettingComments" class="comment-section">
        <h4>View Comments</h4>
        <p v-if="!comments.length" class="mt-6 mb-6">- No Comments Yet</p>
        <ul class="comments-list" v-else>
            <li v-for="item in comments" :key="item.id">
              <v-row no-gutters class="mt-4">
                  <v-col cols="4" md="2" class="text-center mr-8 mt-6">
                    <img v-if="item.pictureUrl" :src="item.pictureUrl" class="comment-thumbnail">
                    <avatar v-else :fullname="item.name" :size="88"></avatar>
                  </v-col>

                  <v-col cols="14" md="8" class="pt-4">
                    <h5 class="name-callout">{{ item.name }} <span>{{ item.createDate | moment("lll") }}</span></h5>
                    <div class="content"><p>{{ item.content }}</p></div>
                  </v-col>
              </v-row>
            </li>
        </ul>

         <div class="text-right mt-2">{{ comments.length }} total comments</div>
    </div>

    <div v-else class="getting-comments">
        <v-progress-circular :size="64" color="#FF530D" indeterminate class="spinner"></v-progress-circular>
        <p>getting comments</p>
    </div>

    <div class="add-comment-area">
      <v-btn v-if="!gettingComments && !commentsReady" @click="openCommentsModal" rounded color="#0c3c60" dark large>
          <message-square-icon size="1.25x" class="mr-2"></message-square-icon> Leave A Comment
      </v-btn>
      <div class="line-through"></div>
    </div>
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
                    <v-btn v-if="!busy" @click="postComment()" color="#0c3c60" dark class="save-comment-btn">Save Comment</v-btn>
                    <v-btn v-else disabled>saving</v-btn>
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
          <v-card-title class="headline">Leave a Comment</v-card-title>
          <v-card-text>
                <div>
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

                    <small @click="$refs.file.click()">add avatar</small>
                    
                    <v-text-field v-model="name" ref="name" class="mt-2 mb-0 w-75 m-auto" label="Enter Name" :rules="[v => !!v || 'Name is required']"></v-text-field>
                    <v-text-field v-model="pinInput" class="w-75 m-auto mb-0" label="Enter PIN" maxlength="6" ref="pinInput"></v-text-field>
                    <small style="margin-top: -1rem; display: block; opacity: .7;">* PIN is supplied by the Funeral Director</small>

                    <div class="mt-6 mb-6">
                      <p class="mb-0" style="color: #ff5252">{{ authError }}</p>
                      <v-btn @click="save()" :loading="busy" :disabled="busy" class="w-75" color="primary">Save</v-btn>
                    </div>
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
  </div>
</template>

<script>
import { UserIcon, CheckCircleIcon, XIcon, MessageSquareIcon } from 'vue-feather-icons';
import Avatar from 'vue-avatar-component'

export default {
    props: {
        slug: {
            type: String
        },
        role: {
            type: String,
            required: false
        },
    },
    data() {
        return {
          busy: false,
          dialog: false,
          gettingComments: true,
          commentContent: '',
          pinInput: '',
          error: '',
          name: '',
          selectedFile: '',
          baseImg: '',
          token: '',
          comments: [],
          commentFields: {
              name: '',
              comment: ''
          },
          showCommentsDialog: false,
          commentUser: [],
          commentsReady: false,
          commentComplete: false,
          blobUrl: '',
          eventId: 0,
          authError: '',
        }
    },
    methods: {
        getComments() {
            this.gettingComments = true;
            this.comments = [];

            this.axios
                .post(`https://api.memoryshare.com/api/comments/getall/${this.slug}`)
                .then(response => {
                    console.log('--- comments ---')
                    console.log(response) 
                    if (response.data.length) {
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
        this.authError = '';
        this.name = '';
        setTimeout(() => {
          this.$refs.name.focus();
        })
      },
      save() {
        const valid = this.$refs.form.validate();
        if (valid) {
          // save
          this.busy = true;
          this.axios
            .post(`https://api.memoryshare.com/api/comments/authorize`, {
              eventId: this.eventId,
              password: this.pinInput,
              name: this.name
            })
            .then(response => {
              this.blobUrl = response.data;
              this.setCommentUser(this.name, this.baseImg);
              this.dialog = false;
            })
            .catch(error => {
              console.log(error)
              this.authError = 'Invalid Pin. Please try again.'
            })
            .then(() => {
              this.busy = false
            })
        }
      },
        postComment() {
          this.busy = true;
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
                            .post(`https://api.memoryshare.com/api/comments/post`, {
                                eventId: _.eventId,
                                name: _.commentUser.name,
                                pictureUrl: _.blobUrl.split('?')[0],
                                content: _.$refs.commentArea.value,
                                slug: _.slug,
                                password: _.pinInput
                            })
                            .then(response => {
                                console.log(response)
                                _.commentComplete = true;
                            })
                            .catch(error => {
                                console.log(error)
                            })
                            .then(() => {
                                _.busy = false
                            })
                    })
                }
            } else {
                this.axios
                    .post(`https://api.memoryshare.com/api/comments/post`, {
                        eventId: this.eventId,
                        name: this.commentUser.name,
                        pictureUrl: null,
                        content: this.$refs.commentArea.value,
                        slug: this.slug,
                        password: this.pinInput
                    })
                    .then(response => {
                        console.log(response)
                        this.commentComplete = true;
                        this.getComments();
                    })
                    .catch(error => {
                        console.log(error)
                    })
                    .then(() => {
                        this.busy = false
                    })
            }
          
        } else {
          console.log('empty')
        }
      },
    },
    components: {
      UserIcon,
      Avatar,
      XIcon,
      CheckCircleIcon,
      MessageSquareIcon
    }
}
</script>

<style lang="scss" scoped>
    
  .container {
    color: #2c3e50;
    padding-top: 3rem;
  }

  .input {
    width: 70%;
    margin: 1.5rem auto -1rem !important;
  }

  .name-callout {
    font-size: 1.3rem;
    font-weight: 500;

    span {
      font-size: 1rem;
      font-weight: 300;
      display: inline-block;
      margin-left: .75rem;
    }
  }

  .preview {
    height: 6.7rem;
    width: 6.7rem;
    margin-top: .2rem;
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
            border-radius: 16px;

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

    .getting-comments {
      text-align: center;
      padding: 4rem 0;
    }

    .content {
      margin-top: .5rem;
      min-height: 4rem;
    }

    .add-comment-area {
      margin: 1rem 0 4rem;
      position: relative;
      // text-align: center;

      .line-through {
        position: absolute;
        top: 50%;
        left: 0;
        transform: translateY(-50%);
        height: 1px;
        width: 100%;
        background: #dadada;
        opacity: .8;
        z-index: 1;
      }

      button {
        position: relative;
        z-index: 2;
        font-size: 1rem;
        margin-left: 5%;
      }
    }
</style>