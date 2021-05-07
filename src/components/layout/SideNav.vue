<template>
    <div v-bind:class="[{ 'show-menu': this.$store.state.menuShowing  }, 'side-nav', 'ease']">
        <div class="logo text-center">
            <router-link :to="{ name: 'Services' }">
                <span>
                    <img :src="require(`@/assets/images/logo.png`)" alt="logo" class="logo menu-collapse">
                </span>
            </router-link>
        </div>

        <ul>
            <li v-bind:class="{ selected: currentRouteName === 'ManageServices' }">
                <router-link :to="{ name: 'ManageServices' }">
                    <arrow-up-circle-icon size="1.25x"></arrow-up-circle-icon>
                    <span v-if="this.$store.state.menuShowing">Upload New Service</span>
                </router-link>
            </li>

            <li v-bind:class="{ selected: currentRouteName === 'Services' || currentRouteName === 'EditServices' || currentRouteName === 'ManageComments' ||  currentRouteName === 'Billing' || currentRouteName === 'Uploader' }">
                <router-link :to="{ name: 'Services' }">
                    <archive-icon size="1.25x"></archive-icon>
                    <span v-if="this.$store.state.menuShowing">All Services</span>
                </router-link>
            </li>

             <li v-bind:class="{ selected: currentRouteName === 'LiveDashboard' }">
                <router-link :to="{ name: 'LiveDashboard' }">
                    <video-icon size="1.25x"></video-icon>
                    <span v-if="this.$store.state.menuShowing">Live Streams</span>
                </router-link>
            </li>
            
            <li v-bind:class="{ selected: currentRouteName === 'Analytics' }">
                <router-link :to="{ name: 'Analytics' }">
                    <bar-chart-icon size="1.25x"></bar-chart-icon>
                    <span v-if="this.$store.state.menuShowing">Analytics</span>
                </router-link>
            </li>
            <li v-if="$auth.role === 'SuperAdmin'" v-bind:class="{ selected: currentRouteName === 'Homes' || currentRouteName === 'ManageHomes' || currentRouteName === 'EditHomes' || currentRouteName === 'AdminSettings' }">
                <router-link :to="{ name: 'Homes' }">
                    <home-icon size="1.25x"></home-icon>
                    <span v-if="this.$store.state.menuShowing">Homes</span>
                </router-link>
            </li>
            <li v-if="$auth.role === 'SuperAdmin'" v-bind:class="{ selected: currentRouteName === 'Users' || currentRouteName === 'ManageUsers' }">
                <router-link :to="{ name: 'Users' }">
                    <users-icon size="1.25x"></users-icon>
                    <span v-if="this.$store.state.menuShowing">Users</span>
                </router-link>
            </li>
            <li v-if="$auth.role === 'SuperAdmin'" v-bind:class="{ selected: currentRouteName === 'Owners'}">
                <router-link :to="{ name: 'Owners' }">
                    <user-plus-icon size="1.25x" />
                    <span v-if="this.$store.state.menuShowing">Owners</span>
                </router-link>
            </li>
            <!-- <li v-if="$auth.role === 'SuperAdmin'" v-bind:class="{ selected: currentRouteName === 'AdminSettings' }">
                <router-link :to="{ name: 'AdminSettings' }">
                    <settings-icon size="1.25x"></settings-icon>
                    <span v-if="this.$store.state.menuShowing">Settings</span>
                </router-link>
            </li> -->
            <li v-if="$auth.role === 'FuneralHome'" v-bind:class="{ selected: currentRouteName === 'Settings' }">
                <router-link :to="{ name: 'Settings' }">
                    <settings-icon size="1.25x"></settings-icon>
                    <span v-if="this.$store.state.menuShowing">Settings</span>
                </router-link>
            </li>
             <li v-if="$auth.role === 'FuneralHome'">
                <a href="http://help.memoryshare.com/en/" target="_blank">
                    <help-circle-icon size="1.25x"></help-circle-icon>
                    <span v-if="this.$store.state.menuShowing">Help Center</span>
                </a>
            </li>
            <li v-if="$auth.role === 'FuneralHome'"  class="footer">
                <router-link :to="{ name: 'Feedback' }">
                    <thumbs-up-icon size="1.25x"></thumbs-up-icon>
                    <span v-if="this.$store.state.menuShowing">Give Feedback</span>
                </router-link>
            </li>
        </ul>
    </div>
</template>

<script>
import { VideoIcon, ArrowUpCircleIcon, ArchiveIcon, BarChartIcon, UserPlusIcon, HomeIcon, UsersIcon, SettingsIcon, ThumbsUpIcon, HelpCircleIcon } from 'vue-feather-icons'

export default {
    computed: {
        currentRouteName() {
            return this.$route.name;
        },
    },
    components: {
        VideoIcon,
        ArrowUpCircleIcon,
        ArchiveIcon, 
        BarChartIcon,
        HomeIcon,
        UsersIcon,
        SettingsIcon,
        ThumbsUpIcon,
        UserPlusIcon,
        HelpCircleIcon
    }
}
</script>

<style lang="scss" scoped>

.logo {
    height: auto;
    margin: 0 auto;

    &.menu-collapse {
        width: 80%;
    }

    &.menu-expanded {
        height: auto;
        width: 50%;
        margin: 0 auto;
    }
}

.logo a {
    color: #333;
}

.side-nav {
    position: fixed;
    width: 4rem;
    height: 100%;
    top: 0;
    left: 0;
    background: #fff;
    border-right: 1px solid #d8d8d8;
    padding: 1rem .5rem;
    box-shadow: 0 .15rem 1.5rem 0 rgba(31,45,65,.15);
    z-index: 11;

    &.show-menu {
        width: 18rem;
    }

    ul {
        list-style-type: none;
        padding: 0;
        margin: 3rem 0 0;
    }

    li {   
        transition: .3s ease-in-out;
        cursor: pointer;
        font-size: 1rem;

        &.selected {
            color: #fff;
            border-radius: 5px;
            background: #FF530D; 

            a { color: #fff }

            &:hover {
                color: #fff;
                border-radius: 5px;
                background: #FF530D;
            }
        }

        a {
            color: #333;
            display: block;
            padding: .75rem;
            margin-bottom: .5rem;

             &:hover {
                 text-decoration: none;
             }
        }

        &:first-child {
            margin-bottom: 1.5rem;
        }

        &.footer {
            background: #dfdfdf;
            position: absolute;
            bottom: -.3rem;
            left: 0;
            margin: 0;
            width: 100%;
            padding: 0 .5rem;
        }

        &:hover {
            background: #eee;
            border-radius: 5px;
        }
    }

    svg {
        margin-right: .75rem;
        vertical-align: sub;
    }
}
</style>
