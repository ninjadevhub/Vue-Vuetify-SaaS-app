<template>
    <div :id="uppyId">
        <div class="DashboardContainer"></div>
    </div>
</template>

<script>
    import Uppy from '@uppy/core';
    import XHRUpload from '@uppy/xhr-upload';
    import Dashboard from '@uppy/dashboard';
    import Form from '@uppy/form'
    import '@uppy/core/dist/style.css';
    import '@uppy/dashboard/dist/style.css';
    import Tus from '@uppy/tus';

    export default {
        props: ['clear', 'modelId', 'data', 'token', 'serviceId'],

        data() {
            return {
                uppy: {},
                file: {},
                responseUrl: '',
                mediaCount: 0,
                maxFiles: 15
            }
        },
        watch: {
            clear: function(newVal, oldVal) {
                //this.data = {};
                this.reset()
            },
        },
        computed: {
            uppyId() {
                return `uppy-${this.modelId}`;
            }
        },
        methods: {
            reset() {
                this.mediaCount = this.data.media.length;
                this.uppy.reset()
            },
            loadUppy() {
                const _ = this;
                this.mediaCount = this.data.media.length;
                console.log(this.data)

                this.uppy = Uppy({
                    id: this.uppyId,
                    autoProceed: false,
                    debug: true,
                    restrictions: {
                        maxFileSize: false,
                        minNumberOfFiles: 1,
                        maxNumberOfFiles: this.maxFiles,
                        allowedFileTypes: ['image/*', 'video/*']
                    },
                    meta: {},
                    onBeforeFileAdded: (currentFile, files) => { 
                        if (this.mediaCount >= 15) {
                            console.log('maxed out')
                        }
                     },
                    onBeforeUpload: (files) => {},
                })
                .use(Dashboard, {
                    inline: true,
                    target: `#${this.uppyId}`,
                    replaceTargetContent: true,
                    note: 'Images and Videos only.',
                    height: 180,
                    replaceTargetContent: true,
                    showProgressDetails: true,
                    browserBackButtonClose: true,
                })
                .on('file-added', (file) => {
                    this.file = file
                    console.log(this.file)
                })
                .on('upload', () => {
                    this.uppy.use(XHRUpload, { 
                        headers: {
                            authorization: `Bearer ${this.token}`,
                        },
                        endpoint: process.env.VUE_APP_API + `/events/createmedia/${ this.data.id }?fileName=${ this.file.name }`,
                        getResponseData (responseText, response) {
                            return responseText
                        },
                    })
                })
                .on('upload-success', (file, response) => {
                    let reader = new FileReader();
                    reader.readAsArrayBuffer(file.data);
                    reader.onload = function() {
                        _.axios
                        .create({ 
                            headers: {
                                'Content-Type': file.type,
                                'x-ms-blob-type': 'BlockBlob'
                            } 
                        })
                        .put( response.body, reader.result )
                        .then(response => {
                            // file.url = response.request.responseURL;
                            // //_.data.media.push(file)

                            // update events list
                            _.axios
                                .create({ headers: {'Authorization': `Bearer ${_.token}`} })
                                .get(process.env.VUE_APP_API + `/events/${ _.data.id  }`)
                                .then(response => {
                                    console.log('--- updated media ---')
                                    console.log(response)
                                    _.$emit('updateList', response.data.media)
                                    _.reset();
                                })
                                .catch(error => {
                                    console.log(error)
                                })

                              _.$emit("message", `${file.name} successfully uploaded`);
                        })
                        .catch(error => {
                            console.log(error)
                            console.log(error.response)
                        })
                    };
                })
                .on('complete', result => {

                    //console.log(result)
                })
            },
            covertObjectToBinary(obj) {
                let output = '',
                    input = JSON.stringify(obj) // convert the json to string.

                for (let i = 0; i < input.length; i++) {
                    output += input[i].charCodeAt(0).toString(2) + " ";
                }
                return output.trimEnd();
            }
        },
        mounted() {
            this.loadUppy();
        },
    }
</script>

<style lang="scss">
    .uppy-Dashboard-AddFiles-title {

        .uppy-Dashboard-browse {
            color: #2275d7;
        }
    }

</style>