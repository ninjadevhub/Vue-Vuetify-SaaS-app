<template>
    <div>
        <div v-if="!ready" class="stream-buffer">
            <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
            <p class="mt-4 text-primary">getting video...</p>
        </div>

        <memoryshare-stream v-else :src="$route.params.slug" options='{"fluid": false, "height": 300, "width": 300, "playerOnly": false}' :token="token"></memoryshare-stream>
    </div>
</template>

<script>
export default {
    metaInfo: {
      title: 'MemoryShare',
      titleTemplate: null
    },
    data() {
        return {
            ready: false,
            backgroundImage: `url(${require('@/assets/images/white-waves.png')})`,
            token: ''
        }
    },
    created(){
        this.$store.dispatch('toggleTopNav');
        let externalScript = document.createElement('script');
        externalScript.setAttribute('src', 'https://memoryshareprod.blob.core.windows.net/front-end-assets/app.js');
        document.head.appendChild(externalScript);
        externalScript.addEventListener('load', () => {
            this.ready = true;
            if (this.$auth.role === 'FuneralHome' || this.$auth.role === 'SuperAdmin') {
                this.$auth.getIdTokenClaims().then(result => {
                    this.token = result.__raw;
                });
            }
        });
    }
}
</script>

<style lang="scss" scoped>
    @import 'https://memoryshareprod.blob.core.windows.net/front-end-assets/app.css';

    .stream-buffer {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        z-index: 10001;
    }
</style>
