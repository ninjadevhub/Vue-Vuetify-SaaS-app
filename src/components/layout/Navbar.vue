<template>
    <div id="nav">
        <!-- non suth user -->
        <div v-if="!$auth.isAuthenticated">
            <Spinner/>
        </div>

        <!-- Auth user -->
        <div v-if="$auth.isAuthenticated && this.$store.state.topNavShowing" class="nav-showing">
            <div v-bind:class="[{ 'menu-showing': this.$store.state.menuShowing }, 'clear-side-nav']">
               <arrow-left-icon v-if="this.$store.state.menuShowing" @click="$store.dispatch('toggleSideNav')" size="1.25x" ></arrow-left-icon>
               <menu-icon v-else @click="$store.dispatch('toggleSideNav')" size="1.25x"></menu-icon>
               <v-chip v-if="$auth.impersonating" class="imperson-chip" color="primary" outlined><user-plus-icon size="1.25x" class="mr-2"></user-plus-icon> Impersonating</v-chip>
            </div>

            <div class="ml-auto position-relative pointer">
                <div class="d-inline-block">
                    <v-btn text @click="getToken()" class=" mr-4">token</v-btn>

                    <router-link :to="{ name: 'LiveDashboard' }" v-if="this.$store.state.streaming" class="live-container"> 
                        <div class="blob"></div> LIVE
                    </router-link>
                    <div v-if="$auth.impersonating" @click="returnToAdmin" class="d-inline-block mr-8">
                        <p class="pointer mb-0" style="font-size: .9rem"><arrow-left-icon size="1.25x" class="mr-2"></arrow-left-icon> Back to Admin</p>
                        <small style="position: absolute; margin-left: 1.9rem">Funeral Home Id: {{ $auth.funeralHomeId }}</small>
                    </div>
                    <span v-else>hello {{ $auth.user.name }}</span>

                    <template>
                        <div class="d-inline-block ml-4">
                            <v-menu offset-y>
                            <template v-slot:activator="{ on, attrs }">
                                <span v-bind="attrs" v-on="on">
                                  <user-icon class="user-icon" size="1.5x"></user-icon>
                                </span>
                            </template>
                            <v-list class="dropdown">
                                <v-list-item>
                                    <router-link :to="{ name: 'Settings' }">
                                        <settings-icon size="1.25x"></settings-icon> settings
                                    </router-link>
                                </v-list-item>
                                <v-list-item @click="getUsers">
                                    <users-icon size="1.25x"></users-icon> manage users
                                </v-list-item>
                                <v-list-item @click="logout">
                                    <log-out-icon size="1.25x"></log-out-icon> logout
                                </v-list-item>
                            </v-list>
                            </v-menu>
                        </div>
                    </template>
                </div>
            </div>
        </div>

        <UsersTable ref="usersTable"></UsersTable>

        <v-snackbar v-model="snackbar" :timeout="2000">
            token copied to clipboard
        </v-snackbar>
    </div>
</template>

<script>
import { ArrowLeftIcon, MenuIcon, UsersIcon, SettingsIcon, LogOutIcon, UserIcon, UserPlusIcon } from 'vue-feather-icons';
import UsersTable from '../UsersTable';
import Spinner from '../Spinner';

export default {
    data() {
        return {
           openUserModal: false,
           snackbar: false,
           homeId: this.$auth.funeralHomeId
        }
    },
    methods: {
        getUsers() {
            this.$refs.usersTable.openDialog = true;
            this.$refs.usersTable.getUsers();
        },
        logout() {
            this.$auth.logout({
                returnTo: window.location.origin
            });
        },
        getToken() {
            this.$auth.getIdTokenClaims().then(result => {
                this.snackbar = true;
                const el = document.createElement('textarea');
                el.value = 'Bearer ' + result.__raw;
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);

            })
        },
        returnToAdmin() {
            this.$auth.getIdTokenClaims().then(result => {
                 this.axios
                .create({ headers: {'Authorization': `Bearer ${ result.__raw }`} })
                .post(process.env.VUE_APP_API + '/superadmin/impersonate', {
                    funeralHomeId: 0,
                    impersonate: false
                })
                .then(response => {
                    this.$router.push({ name: 'Homes'}) 
                    this.$router.go(0);
                })
            })
           
        }
    },
    mounted() {
      setTimeout(() => {
          this.$socket.start({
            log: true // Active only in development for debugging.
        });


        this.$socket.invoke('JoinApplication', this.$auth.funeralHomeId.toString())
      }, 5000)
    },
    sockets: {
      NotifyLive(data) {
        this.$store.dispatch('toggleStreaming', true);
      }
    },
    computed: {
        userLogedIn() {
            return this.$store.state.userIsAuthorized;
        }
    },
    components: {
        UsersTable,
        ArrowLeftIcon,
        MenuIcon,
        UsersIcon,
        SettingsIcon,
        LogOutIcon,
        UserIcon,
        Spinner,
        UserPlusIcon
    }
}
</script>

<style lang="scss" scoped>
    #nav {
        border-bottom: 1px solid #d8d8d8;
        display: flex;
        align-items: center;
        box-shadow: 0 .1rem .25rem 0 rgba(31,45,65,.1);
        position: fixed;
        width: 100%;
        background: #f1f4f7;
        z-index: 11;
    }

    .nav-showing {
        padding: .75rem 2rem;
    }

    .clear-side-nav {
        margin-left: 3rem;
        cursor: pointer;
        width: 1.5rem;
        height: 1.5rem;
        text-align: center;
        transition: .3s ease-in-out;

        &:hover {
            background: #d8d8d8;
            border-radius: 50%;
        }
    }

    .menu-showing {
        margin-left: 17rem;
    }

    #nav > div {
        display: flex;
        align-items: center;
        width: 100%;
    }

    .user-icon {
        border: 2px solid #333;
        width: 2.3rem;
        height: 2.3rem;
        border-radius: 50%;
        padding: .25rem;
    }

    .pointer {
        cursor: pointer;
    }

    .dropdown {
        width: 16rem;
        padding: 1.5rem 1rem;

        svg {
            width: 2rem;
            margin-right: 1rem;
        }

        .v-list-item {
            transition: .3s ease-in-out;

            &:hover {
                cursor: pointer;
                background: #f2f2f2;
            }
        }

        a {
            display: block;
            text-decoration: none;
            color: #333;
        }
    }

    .row.justify-center { position: absolute; }

    .live-container {
        display: inline-block;
        margin-right: 2rem;
        vertical-align: -5%;
        color: rgba(255, 82, 82, 1);
    }

    .imperson-chip {
        position: absolute;
        margin: 0 0 0 2rem;
        top: 1rem;
    }

    .blob {
        display: inline-block;
        border-radius: 50%;
        margin: 0 .5rem;
        height: 15px;
        width: 15px;
        vertical-align: middle;
        background: rgba(255, 82, 82, 1);
        box-shadow: 0 0 0 0 rgba(255, 82, 82, 1);
        animation: pulse-red 2s infinite;
    }

    @keyframes pulse-red {
        0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.7);
        }

        70% {
            transform: scale(1);
            box-shadow: 0 0 0 10px rgba(255, 82, 82, 0);
        }

        100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(255, 82, 82, 0);
        }
    }
</style>