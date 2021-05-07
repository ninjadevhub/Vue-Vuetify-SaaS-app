<template>
    <div class="spinner-container">
        <v-progress-circular :size="64" color="#FF530D" indeterminate class="spinner"></v-progress-circular>
        <img :src="require(`@/assets/images/icon_dark.png`)" alt="logo" class="callout-logo">
    </div>
</template>

<script>
export default {
    props: [
        'showLogo'
    ]
}
</script>

<style scoped>
    .spinner-container {
        position: fixed;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        background: rgba(255,255,255,.5);
        z-index: 11;
    }

    .spinner {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%); 
        z-index: 12;
    }

    .callout-logo {
        position: absolute;
        bottom: 1rem;
        left: 50%;
        transform: translateX(-50%);
        width: 5rem;
        opacity: .8;
        transition: .3s ease-in-out;
    }
</style>