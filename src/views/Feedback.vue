<template>
    <div>
        <side-nav></side-nav>
        <div v-bind:class="[{ 'menu-showing': this.$store.state.menuShowing }, 'dash-container']">
            <div class="tile elevation-6">
                <div class="header">
                    <h4>Leave Feedback</h4>
                </div>

                hello
            </div>
        </div>
    </div>
</template>

<script>
export default {
}
</script>

<style lang="scss" scoped>
.dash-container {
        background: url('https://d1pnnwteuly8z3.cloudfront.net/images/1fde3b9d-4dc8-422c-8e23-bbe443fd0870/f9ae4de7-3055-49e2-885e-92405c900525.svg') no-repeat 0 3rem;
    }

    .tile {
        width: 70%;
        margin: 4rem auto 10%;
        padding: 2rem inherit;
    }
</style> 