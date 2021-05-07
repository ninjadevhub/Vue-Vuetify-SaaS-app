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
            <textarea :value="streamString" ref="embedCode"></textarea>
            <v-btn @click="copyEmbedCode" block small><copy-icon size="1.25x" class="mr-2"></copy-icon> copy Embed Code</v-btn>
        </div> 

        <!-- <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="dialog = false">
            close
          </v-btn>
        </v-card-actions>
      </v-card> -->
    <!-- </v-dialog> -->

    <!-- <v-snackbar v-model="snackbar">
        {{ message }}
    </v-snackbar> -->
  </div>
</template>

<script>
import { CodeIcon, CopyIcon } from 'vue-feather-icons';

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
          this.dialog = true;
          return `<link href="https://memoryshareprod.blob.core.windows.net/front-end-assets/app.css" rel="stylesheet" /><script src="https://memoryshareprod.blob.core.windows.net/front-end-assets/app.js"><\/script><memoryshare-stream src="${ this.slug }" options='{"fluid": true, "height": null, "width": null, "playerOnly": true}' />`;
        },
        copyEmbedCode() {
          console.log(this.slug)
            // console.log(this.$refs.embedCode)
            this.$refs.embedCode.select();
            document.execCommand('copy');
            this.$refs.embedCode.blur();

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

<style lang="scss" scoped>
    .content {
      display: block;

        textarea {
            width: 100%;
            height: 6rem;
            border: 1px solid #dadada;
            border-radius: 5px;
            padding: .5rem;
        }
    }
</style>