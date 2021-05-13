<template>
    <div>
        <!-- <v-dialog v-model="dialog" width="500"> -->
        <!-- <template v-slot:activator="{ on, attrs }">
          <v-tooltip bottom v-bind="attrs" v-on="on" >
              <template v-slot:activator="{ on, attrs }">
                  <v-btn @click="setEmbed()" v-bind="attrs" v-on="on" fab color="#9093b6" dark class="mr-2" small><code-icon size="1.5x"></code-icon></v-btn>
              </template>

              <span>Embed Video</span>
          </v-tooltip>
        </template> -->
        <!--
              <v-card>
                <v-card-title class="headline">
                  Embed Video
                </v-card-title> -->

        <div class="content">
            <v-textarea
                    solo
                    background-color="#1f2227"
                    class="embed-code"
                    auto-grow
                    :value="streamString"
                    ref="embedCode"
            ></v-textarea>
            <v-btn @click="copyEmbedCode" block small>
                <copy-icon size="1.25x" class="mr-2"></copy-icon>
                copy Embed Code
            </v-btn>
        </div>

        <!-- <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="dialog = false">
            close
          </v-btn>
        </v-card-actions>
      </v-card> -->
        <!-- </v-dialog> -->

        <v-snackbar v-model="snackbar" :timeout="3000">
            {{ message }}
        </v-snackbar>
    </div>
</template>

<script>
    import {CodeIcon, CopyIcon} from 'vue-feather-icons';

    export default {
        props: ['slug'],
        data() {
            return {
                dialog: false,
                snackbar: false,
                message: '',
                streamString: this.setEmbed()
            }
        },
        methods: {
            setEmbed() {
                return this.slug
            },
            copyEmbedCode() {
                let textarea = this.$refs.embedCode.$el.querySelector('textarea');
                textarea.select();
                document.execCommand('copy');
                textarea.blur();
                this.message = 'Embed code copied to your clipboard';
                this.snackbar = true;
            }
        },
        components: {
            CodeIcon,
            CopyIcon
        }
    }
</script>

<style lang="scss">
    .content {
        display: block;
    }

    .v-text-field.v-text-field--enclosed .v-text-field__details {
        display: none !important;
    }

    textarea {
        color: burlywood !important;
    }
</style>
