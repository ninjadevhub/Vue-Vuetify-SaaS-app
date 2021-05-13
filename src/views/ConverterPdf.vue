<template>
    <div>
        <side-nav></side-nav>
        <div v-bind:class="[{ 'menu-showing': this.$store.state.menuShowing }, 'dash-container']">
            <v-card-title class="edit-title">
                <h2>Create Memorial Folder for qweqwe qweqwe</h2>
                <v-spacer></v-spacer>
                <div>
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn :to="{ name: 'EditServices', params: {id: $route.params.id}}" fab class="mr-4"
                                   v-bind="attrs" v-on="on" small>
                                <arrow-left-icon size="1.5x"></arrow-left-icon>
                            </v-btn>
                        </template>
                        <span>Back To Manage Service</span>
                    </v-tooltip>
                </div>
            </v-card-title>
            <p class="text-white">This tool converts your memorial folder into an embeddable PDF, which can be displayed
                on your website.
                <br> We will create a thumbnail of the PDF, which will turn into a link that viewers can click on to
                view the PDF.</p>
            <p class="text-white">To get started, click "Add a PDF" and browse to your memorial folder.</p>
            <div v-bind:class="[{'edit': editing}, 'tile', 'form']">
                <div v-if="editing" class="tab-nav">
                    <ul class="tab-list">
                        <li disabled v-bind:class="[{'active': true}, 'service-item']">
                            <span v-bind:class="[{ 'complete': editing }, 'dot']"></span> Service
                        </li>
                        <li v-if="loading" class="text-center mt-2 mb-2">
                            <v-skeleton-loader type="card-heading" width="340"></v-skeleton-loader>
                            <v-skeleton-loader type="card-heading" width="340"></v-skeleton-loader>
                            <v-skeleton-loader type="card-heading" width="340"></v-skeleton-loader>
                            <v-skeleton-loader type="card-heading" width="340"></v-skeleton-loader>
                            <v-skeleton-loader type="card-heading" width="340"></v-skeleton-loader>
                        </li>
                    </ul>
                </div>
                <div v-if="tab === 1" class="tab-container">
                    <v-form ref="form" lazy-validation>
                        <div class="header">
                            <h3 class="title">After uploading your PDF, a link will be generated that
                                you can place on your obituary page.
                                File Format accepted: PDF</h3>
                        </div>
                        <v-row>
                            <v-col class="text-center">
                                <v-file-input
                                        prepend-icon="mdi-file-pdf"
                                        show-size
                                        label="Upload PDF"
                                        @change="uploadPdf"
                                        :rules="errorMessage ? [errorMessage]: []"
                                ></v-file-input>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <p v-if="imageUrls.length">Select the image you wish to crop for your thumbnail.</p>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col v-for="(image, index) in imageUrls" class="text-center" :key="index">
                                <a href="javascript:void(0)" class="pdf-page" @click="selectedPage = index">
                                    <img :class="selectedPage === index ? 'page-has-border': ''" :src="image"/>
                                </a>
                            </v-col>
                        </v-row>
                        <v-row v-if="imageUrls.length && selectedPage != null">
                            <v-col class="text-center">
                                <v-btn @click="chooseImage">Choose Image</v-btn>
                            </v-col>
                        </v-row>
                    </v-form>
                </div>
                <div v-if="tab === 2" class="tab-container">
                    <v-form ref="form" lazy-validation>
                        <div class="header">
                            <h3 class="title">Type the title of the memorial folder into the text-box. Drag the mouse
                                over the image,
                                to crop the selection. Your selection will be displayed on the webpage.</h3>
                        </div>
                        <v-row>
                            <v-col class="text-center">
                                <v-text-field v-model="croppedBody.titleText" label="Title"></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col class="text-center">
                                <a href="javascript:void(0)" class="pdf-page">
                                    <cropper
                                            class="cropper"
                                            :src="imageUrls[selectedPage]"
                                            :stencil-props="{
                                              aspectRatio: 8/5
                                            }"
                                            @change="changeCrop"
                                    ></cropper>
                                </a>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col class="text-center">
                                <v-btn @click="cropImage">Crop</v-btn>
                            </v-col>
                        </v-row>
                    </v-form>
                </div>
            </div>
        </div>
        <Spinner v-if="loading"></Spinner>
    </div>
</template>

<script>
    import Spinner from '../components/Spinner';
    import {ArrowLeftIcon} from 'vue-feather-icons';
    import {Cropper} from 'vue-advanced-cropper';
    import 'vue-advanced-cropper/dist/style.css';

    export default {
        metaInfo: {
            title: 'Create PDF',
        },
        data() {
            return {
                tab: 1,
                imageUrls: [],
                editing: false,
                token: null,
                loading: false,
                selectedPage: null,
                title: null,
                errorMessage: false,
                cropInstruction: [],
                croppedBody: {
                    serviceId: 0,
                    titleText: '',
                    images: [],
                    selectedImageURL: '',
                    cropInstruction: {
                        x: 0,
                        y: 0,
                        width: 0,
                        height: 0,
                        rotate: 0,
                        scaleX: 0,
                        scaleY: 0
                    }
                }
            }
        },

        components: {
            Spinner,
            Cropper,
            ArrowLeftIcon,
        },

        methods: {
            uploadPdf(file) {
                this.loading = true;
                this.$auth.getIdTokenClaims().then(result => {
                    this.token = result.__raw;
                    var fd = new FormData();
                    fd.append("File", file);
                    fd.append("ServiceId", this.$route.params.id);

                    this.axios.create({headers: {'Authorization': `Bearer ${this.token}`}})
                        .post(process.env.VUE_APP_API + '/pdf/upload', fd)
                        .then(res => {
                            this.imageUrls = res.data.imageURLs;
                            this.loading = false;
                        })
                        .catch(error => {
                            this.errorMessage = error.response.data;
                            this.imageUrls = [];
                            this.loading = false;
                        })
                })
            },
            chooseImage() {
                if (this.selectedPage === null) {
                    return false
                }
                this.tab = 2;
            },
            changeCrop({coordinates}) {
                this.croppedBody.cropInstruction.width = coordinates.width;
                this.croppedBody.cropInstruction.height = coordinates.height;
                this.croppedBody.cropInstruction.x = coordinates.left;
                this.croppedBody.cropInstruction.y = coordinates.top;
            },
            cropImage() {
                this.croppedBody.serviceId = this.$route.params.id;
                this.croppedBody.selectedImageURL = this.selectedPage;
                this.croppedBody.images = this.imageUrls;

                this.axios.create({headers: {'Authorization': `Bearer ${this.token}`}})
                    .post(process.env.VUE_APP_API + '/pdf/crop', this.croppedBody)
                    .then(res => {
                        console.log(res);
                        this.loading = false;
                    })
                    .catch(error => {
                        this.errorMessage = error.response.data;
                        this.loading = false;
                    });
            }
        }
    }
</script>

<style lang="scss" scoped>
    .dash-container {
        background: url('https://d1pnnwteuly8z3.cloudfront.net/images/1fde3b9d-4dc8-422c-8e23-bbe443fd0870/3db295f3-24bb-4347-8d2e-c58abfeb92aa.svg') no-repeat 0 -18rem;
    }

    .view-container {
        width: 64vw;
        margin: auto;
        // text-align: center;
        position: relative;
        background: #fff;
        z-index: 1;
    }

    .tab-nav {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        padding: 0;
        margin: 0;
        width: 16rem;
        overflow-y: auto;

        &::-webkit-scrollbar {
            width: 2px;
        }

        .tab-list {
            position: absolute;
            width: 14rem;
            background: #f8f8f8;
            padding: 2rem 0;
            margin: 0;
            height: 100%;
            bottom: 0;
            border-right: 1px solid #f2f2f2;
        }

        .dragable-list {
            padding: 0;
        }

        ul {
            padding: 0;
        }

        li {
            background: #f8f8f8;
            list-style: none;
            padding: 1rem 1.5rem;
            margin: 0;
            cursor: pointer;
            position: relative;
            transition: .3s ease-in-out;

            &:focus {
                outline: none;
            }

            .dot {
                height: .6rem;
                width: .6rem;
                display: inline-block;
                background: #dfdfdf;
                margin-right: .5rem;
                border-radius: 50%;

                &.live {
                    background: rgba(255, 82, 82, 1);
                    box-shadow: 0 0 0 0 rgba(255, 82, 82, 1);
                    animation: pulse-red 2s infinite;
                }
            }

            .complete {
                background: #44ea11;
            }

            &:hover {
                background: #e8e8e8;
            }
        }

        .active {
            background: #90A6B6;
            color: #fff;
            font-weight: 600;
            position: relative;
            z-index: 2;

            &:after {
                content: '';
                position: absolute;
                left: 87%;
                top: 0;
                height: 100%;
                width: 3rem;
                background: #90A6B6;
                border-radius: 50%;
                z-index: 1;
            }

            .add-icon {
                color: #fff;
            }

            &:hover {
                background: #90A6B6;
            }
        }

        .delete-icon {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            right: -.5rem;
            z-index: 2;
            color: #ba3131;
        }
    }

    .menu-placeholder-container {
        background: #f8f8f8;
        padding: .5rem 1rem;
        border-radius: 12px;
        cursor: pointer;

        .menu-placeholder {
            height: 6rem;
            width: 6rem;
            border-radius: 50%;
            border: .5rem solid #dfdfdf;
            background: #f8f8f8;
            display: inline-block;
            vertical-align: middle;
            margin-right: 1rem;
            line-height: 5rem;
            text-align: center;

            svg {
                opacity: .5;
            }
        }

        .preview-menu-placeholder {
            height: 6rem;
            width: 6rem;
            border-radius: 50%;
            object-fit: cover;
            margin-right: 1rem;
        }
    }

    .tab-container {
        padding: 0 4rem 0 2rem;
        min-height: 24rem;
        transition: .3s ease-in-out;

        .row {
            margin-top: .75rem;
        }
    }

    .tile {
        position: relative;
        padding: 2rem 4rem;
        width: 64vw;
        box-shadow: 0 0 1rem #666;
        z-index: 2;
        transition: .3s ease-in-out;

        &.edit {
            padding: 3rem 0 3rem 14rem;
        }
    }

    .row {
        margin-top: 1.5rem;
    }

    .custom-checkbox {
        margin-top: 1rem;
    }

    .event-options .theme--light.v-tabs-items {
        min-height: 4rem;
    }

    .save-btn {
        width: 40%;
    }

    .v-picker {
        width: 100%;
    }

    .datetime-input {
        border-bottom: 1px solid rgba(0, 0, 0, .42);

        label {
            font-size: .75rem;
            color: rgba(0, 0, 0, .6);
            margin-bottom: 0;
        }
    }

    .edit-title {
        padding: 0 8rem;
        margin: 1rem 0;

        h2 {
            color: #fff;
            text-shadow: 1px 1px #333;
        }
    }

    .corner-img {
        width: 30rem;
        height: auto;
        position: fixed;
        bottom: -5rem;
        right: -5rem;
        z-index: 0;
        transition: .3s ease-in-out;
    }

    .checkbox-area {
        background: #f8f8f8;
        border-radius: 2px;
        padding: 0 1rem;

        .v-input {
            width: 50%;
            display: inline-block;
        }
    }

    .flex-row {
        flex-direction: row;
    }

    form {
        width: 90%;
        padding-left: 2rem;
        margin: 0 auto;
    }

    .invalid-input {
        border-color: #ff5252;

        label {
            color: #ff5252;
        }
    }

    .error-text {
        color: #ff5252;
        font-size: 12px;
    }

    .add-icon {
        margin-left: -.2rem;
        margin-right: .4rem;
        color: #666;
    }

    .ghost {
        opacity: .9;
    }

    .media-list {
        list-style: none;
        padding: 0;
        margin: 1rem 0;
        background: #fafafa;
        padding: 1rem 0;

        li {
            padding: 1rem;
        }
    }

    .dash-container .v-data-table {
        min-height: 16rem;
        padding: 0;
    }

    .media-thumbnail {
        width: 3rem;
    }

    .event-options {
        background: #fafafa;
        padding: 1rem;
        margin-bottom: 3rem;
    }

    .stream-tabs {
        margin: 1rem 0 1rem;
    }

    .event-options .theme--light.v-tabs-items {
        background: #fafafa !important;
        padding: 1rem 2rem;
    }

    .service-item {
        padding: 1.5rem !important;
        background: #eee !important;

        &.active {
            background: #90A6B6 !important;
        }
    }

    .text-callout {
        background: #2275d7;
        color: #fff;
        border-radius: 5px;
        padding: .2rem .5rem;
        opacity: .9;
        display: inline-block;
        font-size: .7rem;
        vertical-align: middle;
    }

    .connections-container {
        border: 1px solid #d8d8d8;
        margin-top: 1rem;
        width: 100%;
        padding: 1.5rem 1rem;
        border-radius: 5px;
    }

    .page-has-border {
        border: 3px solid rgba(255, 82, 82, 0.7);
    }

    .pdf-page img {
        width: 220px;
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3)
    }

    @keyframes pulse-red {
        0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.7);
        }

        70% {
            transform: scale(1);
            box-shadow: 0 0 0 10px rgba(255, 82, 82, 0);
        }

        100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(255, 82, 82, 0);
        }
    }

</style>
