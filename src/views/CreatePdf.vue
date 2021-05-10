<template>
    <div>
        <side-nav></side-nav>
        <div v-bind:class="[{ 'menu-showing': this.$store.state.menuShowing }, 'dash-container']">
            <v-card-title class="edit-title">
                <h2>Create Memorial Folder for qweqwe qweqwe</h2>
                <v-spacer></v-spacer>
                <v-btn v-else :to="{ name: 'Services' }" class="mr-4">Back to services</v-btn>
            </v-card-title>
            <p>This tool converts your memorial folder into an embeddable PDF, which can be displayed on your website. We will create a thumbnail of the PDF, which will turn into a link that viewers can click on to view the PDF.</p>
            <p>To get started, click "Add a PDF" and browse to your memorial folder.</p>
        </div>
        <Spinner v-if="loading"></Spinner>
        <Viewer :show="showViewer" :viewSrc="viewerSrc"></Viewer>
    </div>
</template>

<script>
    import {Datetime} from 'vue-datetime';
    import Spinner from '../components/Spinner';
    import draggable from "vuedraggable";
    import UppyUploader from '../components/UppyUploader';
    import {
        Trash2Icon,
        EyeIcon,
        SquareIcon,
        SlashIcon,
        XCircleIcon,
        PlusIcon,
        PlayIcon,
        CopyIcon,
        CheckIcon,
        BarChartIcon,
        ArrowLeftIcon,
        CodeIcon,
        UserIcon,
        UploadIcon,
        FileTextIcon,
        VideoIcon
    } from 'vue-feather-icons';
    import Viewer from '../components/Viewer';
    import QrcodeVue from 'qrcode.vue';
    import VideoPlayer from '../components/VideoPlayer';
    import EmbedModal from '../components/EmbedModal';
    import LiveVideoPreview from '../components/LiveVideoPreview';
    import UppyModal from '../components/UppyModal';
    import ServiceBillingCharts from '../components/ServiceBillingCharts';
    import WowzaEventChart from '../components/WowzaEventChart';

    export default {
        metaInfo: {
            title: 'Create PDF',
        },
        data() {
            return {}
        },

        components: {
            Spinner,
            Viewer,
        },
    }
</script>

<style lang="scss" scoped>


</style>
