<template>
  <div>
    <v-dialog v-model="dialog" width="320">
      <template v-slot:activator="{ on, attrs }">
        <v-btn v-bind="attrs" v-on="on" class="mt-2">Manage Addons</v-btn>
      </template>

      <v-card>
        <v-card-title class="headline">
          Manage Addons
        </v-card-title>

        <v-card-text>
            <v-form class="addons-form">
                <v-row class="align-items-center">
                    <v-col>
                        <h4 class="mb-0">Item 1</h4>
                        <span>this is a description</span>
                    </v-col>
       
                    <v-col class="text-right">
                        <minus-circle-icon @click="testCount--" size="1.5x" class="custom-class"></minus-circle-icon>
                        <span class="addon-amount">{{ testCount }}</span>
                        <plus-circle-icon @click="testCount++" size="1.5x" class="custom-class"></plus-circle-icon>
                    </v-col>
                </v-row>

                <v-checkbox v-model="checkbox" block>
                    <template v-slot:label>
                        <v-spacer></v-spacer>
                        <div class="text-right">
                            <h4 class="mb-0">Item 2</h4>
                            <span>this is a description</span>
                        </div>
                    </template>
                </v-checkbox>
                
                <v-checkbox v-model="checkbox" label="Item 3"></v-checkbox>
            </v-form>
        </v-card-text>

        <v-card-actions>
            <v-btn @click="dialog = false" text>cancel</v-btn>
            <v-spacer></v-spacer>
            <v-btn class="primary">Continue</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { PlusCircleIcon, MinusCircleIcon } from 'vue-feather-icons';

export default {
    data() {
        return {
            dialog: false,
            checkbox: false,
            testCount: 0
        }
    },
    components: {
        PlusCircleIcon,
        MinusCircleIcon
    }
}
</script>

<style lang="scss">
    .addons-form {
        label {
            margin-bottom: 0;
        }
    }

    .addon-amount {
        width: 2rem;
        text-align: center;
        vertical-align: middle;
        font-size: 1.5rem;
        display: inline-block;
    }
</style>