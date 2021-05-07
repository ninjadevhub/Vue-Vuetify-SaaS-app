<template>
    
</template>

<script>
import Uppy from '@uppy/core';
import XHRUpload from '@uppy/xhr-upload';
import Dashboard from '@uppy/dashboard';
import Form from '@uppy/form'
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';

export default {
    data() {
        return {
            uppy: ''
        }
    },
    methods: {
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
        } 
    }
}
</script>