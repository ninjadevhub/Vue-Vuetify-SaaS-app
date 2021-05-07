<template>
    <div>
        <side-nav></side-nav>
        <div v-bind:class="[{ 'menu-showing': this.$store.state.menuShowing }, 'dash-container']">
            streams
        </div>
    </div>
</template>

<script>
export default {
    metaInfo: {
      title: 'Streams',
    },
    data() {
        return {

        }
    },
    mounted() {

    },
    methods: { 
        
    }
}
</script>