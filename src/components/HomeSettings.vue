<template>
  <div>
    <div v-if="$auth.role === 'SuperAdmin'">
        <div class="dash" ref="dashboardContainer"></div>

            <v-form class="mt-8" ref="form">
                <div id="uppy-select-files" class="pointer mb-4">
                    <div class="d-inline-block">
                        <v-btn class="mr-4" fab dark>
                            <upload-icon></upload-icon>
                        </v-btn>
                    </div>

                    <div class="callout-section d-inline-block">
                        <h5 class="mb-1">Upload Logo</h5> 
                        <p class="mb-0"><small>* logo is used on the video player</small></p>
                    </div>
                </div>  

                <div class="mt-8">
                    <v-checkbox v-model="settingsForm.displayCTA" class="clear-bottom">
                        <template v-slot:label>
                            <div>
                                Display Call To Action 

                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on, attrs }">
                                        <help-circle-icon  v-bind="attrs" v-on="on" size="1x" class="custom-class"></help-circle-icon>
                                    </template>
                                    <span>Displayed on the bottom right of the video player</span>
                                </v-tooltip>
                            </div>
                        </template>
                    </v-checkbox>
                    <div :class="[{ 'disabled-bg': !settingsForm.displayCTA }, 'ease']">
                        <v-text-field v-model="settingsForm.callToActionHeading" label="Call To Action Heading"></v-text-field>
                        <v-text-field v-model="settingsForm.callToActionButtonText" label="Call To Action Button Text"></v-text-field>
                        <v-text-field v-model="settingsForm.callToActionButtonLink" label="Call To Action Button Link"></v-text-field>
                    </div>
                </div>                

                 <v-row v-if="$auth.role === 'SuperAdmin'">
                    <v-col>
                        <v-select v-model="settingsForm.azureVMSize" :items="azureVMSizes" label="Azure VM Size"></v-select>
                    </v-col>
                    <v-col>
                        <v-select v-model="settingsForm.wowzaServerLocation" :items="wowzaServerLocations"  label="Wowza Server Location"></v-select>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col>
                        <v-select v-model="settingsForm.websiteProvider" :items="websiteProviders" label="Website Provider"></v-select>
                    </v-col>
                    <v-col>
                        <v-select v-model="settingsForm.streamingProvider" :items="streamingProviders" label="Streaming Provider"></v-select>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col>
                        <v-text-field v-model="settingsForm.facebookRtmps" label="Facebook RTMPS"></v-text-field>
                    </v-col>
                    <v-col>
                        <v-text-field v-model="settingsForm.facebookStreamKey" label="Facebook Stream Key"></v-text-field>
                    </v-col>
                </v-row>

                <v-checkbox v-model="settingsForm.displayTutorial" label="Display Tutorial"></v-checkbox>
                <v-checkbox v-model="settingsForm.skipLivePreview" label="Skip Live Preview"></v-checkbox>
                <v-checkbox v-if="$auth.role === 'SuperAdmin'" v-model="settingsForm.dvdForSale" label="DVD For Sale"></v-checkbox>
                <v-checkbox v-if="$auth.role === 'SuperAdmin'" v-model="settingsForm.transcoded" label="Transcoded"></v-checkbox>  
                
                <div class="mt-4 text-right">
                    <v-btn v-if="!busy" @click="dialog = false" class="mr-2">cancel</v-btn>
                    <v-btn @click="save()" :loading="busy" :disabled="busy" color="primary">Save</v-btn>
                </div>
            </v-form>
    </div>

    <v-form v-else ref="form">
        <div class="dash" ref="dashboardContainer"></div>
        <div id="uppy-select-files" class="pointer mb-6">
            <div class="d-inline-block">
                <v-btn class="mr-4" fab dark>
                    <upload-icon></upload-icon>
                </v-btn>
            </div>

            <div class="callout-section d-inline-block">
                <h5 class="mb-1">Upload Logo</h5> 
                <p class="mb-0"><small>* logo is used on the video player</small></p>
            </div>
        </div>  

        <v-checkbox v-model="settingsForm.displayTutorial" label="Display Call To Action"></v-checkbox>
        <v-text-field v-model="settingsForm.callToActionHeading" label="Call To Action Heading"></v-text-field>
        <v-text-field v-model="settingsForm.callToActionButtonText" label="Call To Action Button Text"></v-text-field>
        <v-text-field v-model="settingsForm.callToActionButtonLink" label="Call To Action Button Link"></v-text-field>

        <v-row>
            <v-col>
                <v-text-field v-model="settingsForm.facebookRtmps" label="Facebook RTMPS"></v-text-field>
            </v-col>
            <v-col>
                <v-text-field v-model="settingsForm.facebookStreamKey" label="Facebook Stream Key"></v-text-field>
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <v-select v-model="settingsForm.websiteProvider" :items="websiteProviders" label="Website Provider"></v-select>
            </v-col>
            <v-col>
                <v-select v-model="settingsForm.streamingProvider" :items="streamingProviders" label="Streaming Provider"></v-select>
            </v-col>
        </v-row>

        <v-checkbox v-model="settingsForm.displayTutorial" label="Display Tutorial"></v-checkbox>
        <v-checkbox v-if="$auth.role === 'SuperAdmin'" v-model="settingsForm.dvdForSale" label="DVD For Sale"></v-checkbox>
        <v-checkbox v-if="$auth.role === 'SuperAdmin'" v-model="settingsForm.transcoded" label="Transcoded"></v-checkbox>
        <v-checkbox v-if="$auth.role !== 'SuperAdmin'" v-model="settingsForm.skipLivePreview" label="Skip Live Preview"></v-checkbox>
        
        <div class="mt-4 text-right">
            <v-btn @click="save()" :loading="busy" :disabled="busy" color="primary">Save</v-btn>
        </div>
    </v-form>
    
  </div>
</template>

<script>
import { UploadIcon, HelpCircleIcon } from 'vue-feather-icons';
import Uppy from '@uppy/core';
import XHRUpload from '@uppy/xhr-upload';
import Dashboard from '@uppy/dashboard';
import Form from '@uppy/form'
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';

export default {
    props: ['modal', 'token', 'admin', 'id'],
    data() {
        return {
            dialog: false,
            home: '',
            uppy: '',
            busy: false,
            settingsForm: {
                azureVMSize: 'Standard_D4_v2',
                wowzaServerLocation: 'us_central_iowa',
                websiteProvider: '',
                streamingProvider: '',
                displayTutorial: true,
                dvdForSale: true,
                displayCTA: true,
                transcoded: true,
                whiteLabel: false,
                callToActionHeading: '',
                callToActionButtonText: '',
                callToActionButtonLink: '',
                facebookRtmps: null,
                facebookStreamKey: null,
                skipLivePreview: true
            },
            azureVMSizes: ['Standard_D4_v2', 'Standard_D1_v2'],
            streamingProviders: ['GoCoder', 'Larix', 'MWSApp', 'RTMP', 'Teradek'],
            websiteProviders: ['FuneralOne', 'Batesville', 'FuneralNet', 'Frazer', 'Beyondfunerals', 'FuneralFuturistWebsites', 'AzureRawLink', 'CFS', 
                'WordPress', 'GenericIframe', 'Aurora', 'IframeLink', 'Button', 'ViewingLink', 'NonResponsive'],
            wowzaServerLocations: ['asia_pacific_australia', 'asia_pacific_india', 'asia_pacific_japan', 'asia_pacific_s_korea', 'asia_pacific_singapore', 'asia_pacific_taiwan', 'eu_belgium', 'eu_germany', 'eu_ireland', 'south_america_brazil', 'us_central_iowa', 'us_east_s_carolina', 'us_east_virginia', 'us_west_california', 'us_west_oregon'],
        }
    },
    methods: {
        openDialog() {
            this.dialog = true;
            this.getSettings();
            setTimeout(() => {
                this.initUppy();
            })
        },
        initUppy() {
            this.uppy = Uppy({
                debug: true,
                autoProceed: false,
                trigger: '#uppy-select-files',
                restrictions: {
                        minNumberOfFiles: 1,
                        maxNumberOfFiles: 1,
                        allowedFileTypes: ['image/*']
                }
            })
            .use(Dashboard, {
                hideUploadButton: false,
                inline: false,
                height: 450,
                target: this.$refs.dashboardContainer,
                replaceTargetContent: true,
                showProgressDetails: true,
                browserBackButtonClose: true
            })
        },
        getSettings() {
            if (this.$auth.role === 'SuperAdmin') {
                this.axios
                    .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                    .get(process.env.VUE_APP_API + `/funeralhomes/settings/admin/${ this.id }`)
                    .then(response => {
                        console.log(response)
                        let data = response.data

                        if (response.data) {
                            this.settingsForm = {
                                azureVMSize: data.azureVMSize,
                                wowzaServerLocation: data.wowzaServerLocation,
                                websiteProvider: this.websiteProviders[data.websiteProvider],
                                streamingProvider: this.streamingProviders[data.streamingProvider],
                                displayTutorial: data.displayTutorial,
                                dvdForSale: data.dvdForSale,
                                displayCTA: data.displayCTA,
                                transcoded: data.transcoded,
                                whiteLabel: data.whiteLabel,
                                callToActionHeading: data.callToActionHeading,
                                callToActionButtonText: data.callToActionButtonText,
                                callToActionButtonLink: data.callToActionButtonLink,
                                skipLivePreview: data.skipLivePreview,
                                facebookRtmps: data.facebookRtmps,
                                facebookStreamKey: data.facebookStreamKey
                            }
                        }
                })
                .catch(error => {
                    console.log(error)
                    console.log(error.response)
                    this.$emit('message', error.response.data)
                })
            } else {
                 this.axios
                .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                .get(process.env.VUE_APP_API + `/funeralhomes/settings/${ this.$auth.funeralHomeId }`)
                .then(response => {
                    console.log(response)
                    let data = response.data

                    if (response.data) {
                        this.settingsForm = {
                            azureVMSize: data.azureVMSize,
                            wowzaServerLocation: data.wowzaServerLocation,
                            websiteProvider: this.websiteProviders[data.websiteProvider],
                            streamingProvider: this.streamingProviders[data.streamingProvider],
                            displayTutorial: data.displayTutorial,
                            skipLivePreview: data.skipLivePreview,
                            dvdForSale: data.dvdForSale,
                            displayCTA: data.displayCTA,
                            transcoded: data.transcoded,
                            whiteLabel: data.whiteLabel,
                            callToActionHeading: data.callToActionHeading,
                            callToActionButtonText: data.callToActionButtonText,
                            callToActionButtonLink: data.callToActionButtonLink,
                            facebookRtmps: data.facebookRtmps,
                            facebookStreamKey: data.facebookStreamKey
                        }
                    }
                })
                .catch(error => {
                    console.log(error)
                })
            }
        },
        save() {
            this.busy = true;
            if (this.$auth.role === 'SuperAdmin') {
                let data = {
                    funeralHomeId: +this.id,
                    logoPath: null,
                    websiteProvider: this.websiteProviders.indexOf(this.settingsForm.websiteProvider),
                    displayTutorial: this.settingsForm.displayTutorial,
                    skipLivePreview: this.settingsForm.skipLivePreview,
                    whiteLabel: false,
                    azureVMSize: this.settingsForm.azureVMSize,
                    dvdForSale: this.settingsForm.dvdForSale,
                    transcoded: this.settingsForm.transcoded,
                    wowzaServerLocation: this.settingsForm.wowzaServerLocation,
                    streamingProvider: this.streamingProviders.indexOf(this.settingsForm.streamingProvider),
                    displayCTA: this.settingsForm.displayCTA,
                    callToActionHeading: this.settingsForm.callToActionHeading,
                    callToActionButtonText: this.settingsForm.callToActionButtonText,
                    callToActionButtonLink: this.settingsForm.callToActionButtonLink,
                    facebookRtmps: this.settingsForm.facebookRtmps,
                    facebookStreamKey: this.settingsForm.facebookStreamKey
                }

                this.axios
                    .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                    .put(process.env.VUE_APP_API + `/funeralhomes/settings/admin`, data)
                    .then(response => {
                        console.log(response)
                        this.$emit('message', 'Home updated')
                    })
                    .catch(errors => {
                        console.log(errors)
                        this.$emit('message', 'Error updating home')
                    })
                    .then(() => {
                        this.busy = false;
                    })
            } else {
                let data = {
                    funeralHomeId: this.$auth.funeralHomeId,
                    logoPath: null,
                    websiteProvider: this.websiteProviders.indexOf(this.settingsForm.websiteProvider),
                    displayTutorial: this.settingsForm.displayTutorial,
                    streamingProvider: this.streamingProviders.indexOf(this.settingsForm.streamingProvider),
                    displayCTA: this.settingsForm.displayCTA,
                    callToActionHeading: this.settingsForm.callToActionHeading,
                    callToActionButtonText: this.settingsForm.callToActionButtonText,
                    callToActionButtonLink: this.settingsForm.callToActionButtonLink,
                    skipLivePreview: this.settingsForm.skipLivePreview,
                    facebookRtmps: this.settingsForm.facebookRtmps,
                    facebookStreamKey: this.settingsForm.facebookStreamKey
                }

                 this.axios
                    .create({ headers: {'Authorization': `Bearer ${this.token}`} })
                    .put(process.env.VUE_APP_API + `/funeralhomes/settings`, data)
                    .then(response => {
                        console.log(response)
                    })
                    .catch(errors => {
                        console.log(errors)
                    })
                    .then(() => {
                        this.busy = false;
                    })
            }
        }
    },
    components: {
        UploadIcon,
        HelpCircleIcon
    }
}
</script>

<style lang="scss" scoped>
    .clear-bottom {
        margin-bottom: -1rem;
    }

    .disabled-bg {
         padding: 0 1rem;
        border-radius: 5px;
        background: #f8f8f8;
    }
</style>