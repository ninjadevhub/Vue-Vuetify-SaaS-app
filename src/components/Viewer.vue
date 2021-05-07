<template>
    <div v-if="show" id="viewer-container">
        <div id="viewer">
            <img :src="imgSrc" :alt="viewSrc.name" />
            <v-btn @click="handleClose()" elevation="2" >close</v-btn>
        </div>
    </div>
</template>

<script>
export default {
    props: ['show', 'viewSrc'],
    data() {
        return {
            imgSrc: '',
            imgAlt: ''
        }
    },
    watch: {
        show: {
            handler() {
                if (this.show) {
                    this.imgSrc = this.viewSrc.url ? this.viewSrc.url : this.viewSrc;
                    this.imgAlt = this.viewSrc.name ? this.viewSrc.name : 'placeholder';
                }
            }
        }
    },
    methods: {
        handleClose(e) {
            this.$parent.expandMedia()
        }
    },
}
</script>

<style lang="scss" scoped>
    #viewer-container {
        position: fixed;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        background: rgba(0,0,0,.7);
        z-index: 11;
        text-align: center;
    }

    #viewer {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        // background: #fff;
        // height: 80vh;
        // width: 90vw;
        z-index: 12;

        img {
            object-fit: cover;
            width: 60vw;
            height: auto;
            max-height: 80vh;
            box-shadow: 0 0 4px #333;
            margin-bottom: 1rem;
        }
    }
</style>