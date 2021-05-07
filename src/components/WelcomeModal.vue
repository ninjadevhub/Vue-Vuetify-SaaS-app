<template>
  <div>
    <v-dialog v-model="dialog" width="64rem">
      <template v-slot:activator="{ on, attrs }">
        <v-btn color="red lighten-2 mb-2" dark v-bind="attrs" v-on="on">view welcome modal</v-btn>
      </template>

      <v-card>
        <v-card-text>
            <v-row>
                <v-col class="content">
                    <h1>Welcome To MemoryShare</h1>
                    <v-btn @click="dialog = false" color="#ff5252" dark class="mt-4">Lets Get Started</v-btn>
                </v-col>
                <v-col>
                    <img src="https://d1pnnwteuly8z3.cloudfront.net/images/1fde3b9d-4dc8-422c-8e23-bbe443fd0870/b2f06338-a853-4f8c-b19f-7265e27df50e.png" alt="family" class="funeral-img">
                </v-col>
            </v-row>
            
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
    data() {
        return {
            dialog: false
        }
    }
}
</script>

<style lang="scss" scoped>
    .v-card {
        background: url('https://d1pnnwteuly8z3.cloudfront.net/images/1fde3b9d-4dc8-422c-8e23-bbe443fd0870/f93c8bac-6f36-4379-a2a3-ef312021d719.svg') no-repeat  center;
        background-color: #fff;
        padding: 2.5rem 5rem 0;
    }

    .funeral-img {
        width: 28rem;
    }

    .content {
        margin-top: 8vh;

        h1 {
            line-height: 3.5rem;
            margin-bottom: 1rem;
        }
    }
</style>