<template> 
    <div class="edit-card-area">
        <h5 class="mb-0">Edit card</h5>
        <small>current card ends with 4141</small>

          <card class='stripe-card'
            :class='{ complete }'
            :stripe="stripe"
            :options='options'
            @change='complete = $event.complete'
            />

        <v-btn color="primary" @click="submit" block>Update Card</v-btn>
    </div>
</template>

<script>
import { Card, createToken } from 'vue-stripe-elements-plus'

export default {
    data() {
        return {
            stripe: process.env.VUE_APP_STRIPE_KEY,
            complete: false,
            options: {
                // see https://stripe.com/docs/stripe.js#element-options for details
            },
        }
    },
    methods: {
        submit() {
            createToken().then(data => console.log(data))
        },
    },
    components: {
        Card
    }
}
</script>

<style lang="scss" scoped>
    .stripe-card {
        width: 100%;
        margin: 2rem 0;
        border-bottom: 1px solid #d8d8d8;

        &.complete {
            border-color: #85c785;
        }
    }

    small {
        opacity: .7;
    }

    .credit-card-inputs {
        border-bottom: 2px solid #d8d8d8;
    }

    .stripe-element {
        border-bottom: 1px solid #d8d8d8;
    }

    .edit-card-area {
        background: #fafafa;
        padding: 2rem;
        border-radius: 5px;
        margin-top: 1rem;
    }
</style>