<template>
    <div>
        <side-nav></side-nav>
        <div v-bind:class="[{ 'menu-showing': this.$store.state.menuShowing }, 'dash-container']">
            <v-card-title class="edit-title">
                <h2>{{ editing ? `Service for ${firstName} ${lastName}` : 'Create New Service' }}</h2>
                <span v-if="testService" class="text-callout ml-3" style="line-height: 1.3rem">TEST</span>
                <v-spacer></v-spacer>
                <div v-if="editing">
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn :to="{ path: `/manage-services/${ serviceID }/create-pdf` }" v-bind="attrs"
                                   v-on="on" fab color="#9093b6" dark class="mr-2" small>
                                <file-text-icon size="1.5x"></file-text-icon>
                            </v-btn>
                        </template>
                        <span>Add Funeral Program PDF</span>
                    </v-tooltip>
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn :to="{ path: `/services/view/${ videoSlug }` }" target="_blank" v-bind="attrs"
                                   v-on="on" fab color="#9093b6" dark class="mr-2" small>
                                <play-icon size="1.5x"></play-icon>
                            </v-btn>
                        </template>

                        <span>View Stream</span>
                    </v-tooltip>
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn :to="{ path: `/analytics/${ $route.params.id  }` }" v-bind="attrs" v-on="on" fab
                                   color="#9093b6" dark class="mr-2" small>
                                <bar-chart-icon size="1.5x"></bar-chart-icon>
                            </v-btn>
                        </template>

                        <span>View Analytics</span>
                    </v-tooltip>

                    <!-- <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn :to="{ path: `/manage-services/comments/${ videoSlug  }` }" v-bind="attrs" v-on="on" fab color="#9093b6" dark class="mr-2" small>
                                <file-text-icon size="1.5x"></file-text-icon>
                            </v-btn>
                    </template>

                        <span>Manage Comments</span>
                    </v-tooltip> -->

                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn :to="{ name: 'Services' }" fab class="mr-4" v-bind="attrs" v-on="on" small>
                                <arrow-left-icon size="1.5x"></arrow-left-icon>
                            </v-btn>
                        </template>

                        <span>Back To Services</span>
                    </v-tooltip>
                </div>

                <v-btn v-else :to="{ name: 'Services' }" class="mr-4">Back to services</v-btn>

            </v-card-title>

            <div v-bind:class="[{'edit': editing}, 'tile', 'form']">
                <div v-if="editing" class="tab-nav">
                    <ul class="tab-list">
                        <li @click="changeTab(-1)" disabled v-bind:class="[{'active': tab === -1}, 'service-item']">
                            <span v-bind:class="[{ 'complete': editing }, 'dot']"></span> Service
                        </li>
                        <li v-if="loading" class="text-center mt-2 mb-2">
                            <v-skeleton-loader type="card-heading" width="340"></v-skeleton-loader>
                            <v-skeleton-loader type="card-heading" width="340"></v-skeleton-loader>
                            <v-skeleton-loader type="card-heading" width="340"></v-skeleton-loader>
                            <v-skeleton-loader type="card-heading" width="340"></v-skeleton-loader>
                            <v-skeleton-loader type="card-heading" width="340"></v-skeleton-loader>
                        </li>

                        <!-- sorted by date -->
                        <ul v-show="!loading && events.length">
                            <li v-for="item in sortItems()" :key="item.id" @click="changeTab(0, item)"
                                v-bind:class="{'active': item.active}">
                                <span v-if="item.state === 1" class="dot live"></span>
                                <span v-else
                                      v-bind:class="[{ 'complete': (item.title.length && item.time) || (item.eventType === 0  && item.convertedVideo ) }, 'dot']"></span>
                                {{ item.menuTitle }}

                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on, attrs }">
                                        <span @click="openDeleteModal(item.id, false, item)"
                                              v-show="item.active && !item.time" v-bind="attrs" v-on="on"
                                              class="delete-icon"><x-circle-icon size="1.25x"
                                                                                 class="custom-class"></x-circle-icon></span>
                                    </template>

                                    <span>Delete Event</span>
                                </v-tooltip>
                            </li>
                        </ul>

                        <li @click="changeTab(99)" v-bind:class="{'active': tab === 99}">
                            <plus-icon size="1x" class="add-icon"></plus-icon>
                            Add
                        </li>
                    </ul>
                </div>

                <!-- Service -->
                <div v-if="tab === -1" v-bind:class="{'tab-container': editing}">
                    <v-form ref="form" lazy-validation>
                        <div class="header">
                            <h3 v-if="!editing" class="title">Create New Service</h3>
                            <!-- v-if="editing && testService" -->
                            <h3 v-else>Edit Service <span v-if="testService" class="text-callout">TEST</span></h3>
                        </div>

                        <v-row>
                            <v-col>
                                <v-text-field v-model="firstName" label="First Name"
                                              :rules="[v => !!v || 'First name is required']"></v-text-field>
                            </v-col>

                            <v-col>
                                <v-text-field v-model="lastName" label="Last Name"
                                              :rules="[v => !!v || 'Last name is required']"></v-text-field>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col>
                                <v-menu ref="menu" v-model="birthDateMenu" :close-on-content-click="false"
                                        :return-value.sync="birthDate" transition="scale-transition" offset-y
                                        min-width="290px">
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-text-field
                                                :value="computedBirthDate"
                                                label="Birthdate"
                                                readonly
                                                :rules="[v => !!v || 'Birthdate is required']"
                                                v-bind="attrs"
                                                v-on="on"
                                        ></v-text-field>
                                    </template>
                                    <v-date-picker v-model="birthDate" no-title scrollable>
                                        <v-spacer></v-spacer>
                                        <v-btn text color="primary" @click="birthDateMenu = false"> Cancel</v-btn>
                                        <v-btn text color="primary" @click="$refs.menu.save(birthDate)">OK</v-btn>
                                    </v-date-picker>
                                </v-menu>
                            </v-col>

                            <v-col>
                                <v-menu ref="menu" v-model="deathDateMenu" :close-on-content-click="false"
                                        :return-value.sync="deathDate" transition="scale-transition" offset-y
                                        min-width="290px">
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-text-field
                                                :value="computedDeathDate"
                                                label="Death Date"
                                                readonly
                                                :rules="[v => !!v || 'Date of death is required']"
                                                v-bind="attrs"
                                                v-on="on"
                                        ></v-text-field>
                                    </template>
                                    <v-date-picker v-model="deathDate" scrollable>
                                        <v-spacer></v-spacer>
                                        <v-btn text color="primary" @click="deathDateMenu = false"> Cancel</v-btn>
                                        <v-btn text color="primary" @click="$refs.menu.save(deathDate)">OK</v-btn>
                                    </v-date-picker>
                                </v-menu>
                            </v-col>
                        </v-row>

                        <!-- <div v-if="editing" class="menu-placeholder-container">
                            <div v-if="!hidePlaceholder && !service.pictureURL" @click="$refs.file.click()" class="menu-placeholder">
                                <user-icon size="3x"></user-icon>
                            </div>
                            <img v-show="hidePlaceholder && !service.pictureURL" @click.self="expandMedia(null)" ref="preview" class="preview-menu-placeholder" />
                            <img v-if="service.pictureURL" :src="service.pictureURL" @click.self="expandMedia(null)" ref="preview" class="preview-menu-placeholder" />

                            <v-btn @click="$refs.file.click()"><upload-icon size="1.5x" class="mr-2"></upload-icon> {{ service.pictureURL ? 'Change video menu image' : 'Upload video menu image' }}</v-btn>

                            <input @change="onFileSelected" type="file" ref="file" accept="image/*" style="display: none">
                        </div> -->

                        <!-- <v-row v-if="editing" class="pa-1 align-items-center">
                            <v-col class="align-self-center">
                                <h6 class="mt-0">Comments PIN</h6>
                            </v-col>
                            <v-col class="text-right">
                                <h5>
                                    {{ service.pin }}
                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ on, attrs }">
                                            <span v-bind="attrs" v-on="on" @click="copyText(event.pin)">
                                                <copy-icon size=".75x" class="mb-1 ml-3"></copy-icon>
                                            </span>
                                        </template>

                                        <span>Copy PIN</span>
                                    </v-tooltip>
                                </h5>
                            </v-col>
                        </v-row> -->

                         <v-textarea v-if="embedCode.length" v-model="embedCode" disabled outlined class="mt-4" label="Embed Code"></v-textarea>
                        <div v-if="embedCode.length" class="text-right" style="margin-top: -1rem">
                            <v-btn @click="copyText(embedCode)" text><copy-icon size="1x" class="mr-2"></copy-icon> Copy Embed Code</v-btn>
                        </div>

                        <v-checkbox v-if="!editing" v-model="testService" label="Test Service"></v-checkbox>

                        <div class="mt-2 mb-6">
                            <v-btn v-if="!busy && !uploadingPlaceholderImg" @click.prevent="saveService($data)" block
                                   color="#0C3C60" dark large class="save-btn">{{ editing ? 'Update Service' : 'SaveService' }}
                            </v-btn>
                            <v-btn v-else block disabled class="ml-3 save-btn">
                                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                                <small v-if="uploadingPlaceholderImg" style="display:inline-block; margin-left: .5rem">uploading
                                    placeholder image...</small>
                            </v-btn>
                        </div>

                    </v-form>
                </div>

                <!-- Events -->
                <div v-if="tab === 0" class="tab-container">
                    <v-form ref="form" lazy-validation class="">
                        <div>
                            <h4>{{ event.title }}</h4>

                            <v-tabs v-if="event.media.length" v-model="pageTab" class="mt-4" fixed-tabs>
                                <v-tab href="#details">Details</v-tab>
                                <v-tab href="#manageMedia">Manage Media</v-tab>
                            </v-tabs>
                        </div>

                        <v-tabs-items :value="pageTab">
                            <v-tab-item value="details">
                                <v-card-text>
                                    <v-text-field v-model="event.title" label="Title"
                                                  :rules="[v => !!v || 'Title is required']"></v-text-field>

                                    <v-row v-if="event.eventType !== 0">
                                        <v-col>
                                            <div v-bind:class="[{ 'invalid-input': event.errors.includes('time') }, 'datetime-input']">
                                                <label for="serviceDate">Event Date & Time</label>
                                                <datetime
                                                        :disabled="event.media.length > 0 || (event.streamState !== 0 && event.liveStreamId !== null)"
                                                        id="serviceDate" placeholder="-- --" type="datetime"
                                                        :minute-step="15" use12-hour v-model="event.time"
                                                        class="theme-orange" required
                                                        :rules="[v => !!v || 'Time is required']"></datetime>
                                            </div>
                                            <div v-if="event.errors.includes('time')" class="error-text">Date and Time
                                                are required
                                            </div>
                                        </v-col>
                                    </v-row>

                                    <v-col v-if="event.liveStreamId === null" class="checkbox-area flex-row">
                                        <v-checkbox v-model="event.private" label="Private"></v-checkbox>
                                        <v-checkbox v-if="event.eventType > 0" v-model="event.live"
                                                    label="Live"></v-checkbox>
                                    </v-col>

                                    <!-- Only show on static videos for now -->
                                    <div v-if="!event.live" class="checkbox-area pt-2 mb-4 pb-4">
                                        <v-btn @click="goToVideoUploader">
                                            <video-icon size="1.5x" class="mr-2"/>
                                            Add Video Files
                                        </v-btn>
                                    </div>

                                    <div v-if="!liveSteramQr.length" class="mt-2 mb-6">
                                        <v-btn v-if="!busy" block color="#0C3C60" dark large
                                               @click.prevent="saveEvent(event.id)">update
                                        </v-btn>
                                        <v-btn v-else block large>
                                            <v-progress-circular indeterminate color="primary"></v-progress-circular>
                                        </v-btn>
                                        <!-- <v-btn v-if="!event.media.length" @click="openDeleteModal(event.id, false, event)" text block small class="mt-5"><trash-2-icon size="1x" class="mr-1"></trash-2-icon> delete</v-btn>                    -->
                                    </div>


                                    <div v-if="gettingStreamState && event.liveStreamId !== null"
                                         class="event-options text-center">
                                        <v-progress-circular indeterminate color="primary"></v-progress-circular>
                                        <h6>checking stream</h6>
                                    </div>


                                    <div v-if="event.liveStreamId && !gettingStreamState"
                                         class="event-options text-center pa-4 pb-6 mt-4">

                                        <!-- Live Stream Waiting Room -->
                                        <div v-if="!liveSteramQr.length">
                                            <v-tabs v-model="streamTab" class="stream-tabs" background-color="#fafafa"
                                                    fixed-tabs>
                                                <v-tab href="#manage">Manage</v-tab>
                                                <v-tab @click="setWowzaChart" href="#options">Health</v-tab>
                                                <v-tab href="#connections">Connections</v-tab>
                                            </v-tabs>

                                            <v-tabs-items :value="streamTab">
                                                <v-tab-item value="manage">
                                                    <v-btn v-if="!liveSteramQr.length" @click="startLiveStream()"
                                                           color="success" block large>
                                                        <play-icon size="1x" class="mr-2"></play-icon>
                                                        Start Live Stream
                                                    </v-btn>
                                                    <!-- <v-btn v-if="!liveSteramQr.length && event.streamState > 0" @click="markStreamAsComplete" block class="mt-4"><check-icon size="1x" class="mr-2"></check-icon> Mark Stream Complete</v-btn> -->
                                                </v-tab-item>

                                                <v-tab-item value="options">
                                                    <wowza-event-chart :live="false" :token="token" ref="wowzaChart"/>
                                                </v-tab-item>

                                                <v-tab-item value="connections">
                                                    <v-form>
                                                        <v-text-field @click="copyText(connection.primaryServer)"
                                                                      label="RTMP" :value="connection.primaryServer"
                                                                      readonly>
                                                            <v-icon slot="append">mdi-clipboard</v-icon>
                                                        </v-text-field>
                                                        <v-text-field @click="copyText(connection.streamName)"
                                                                      label="Name" :value="connection.streamName"
                                                                      readonly>
                                                            <v-icon slot="append">mdi-clipboard</v-icon>
                                                        </v-text-field>
                                                        <v-text-field @click="copyText(connection.userName)"
                                                                      label="Username" :value="connection.userName"
                                                                      readonly>
                                                            <v-icon slot="append">mdi-clipboard</v-icon>
                                                        </v-text-field>
                                                        <v-text-field @click="copyText(connection.password)"
                                                                      label="Password" :value="connection.password"
                                                                      readonly>
                                                            <v-icon slot="append">mdi-clipboard</v-icon>
                                                        </v-text-field>

                                                        <v-btn block color="primary" class="mb-2">Save</v-btn>
                                                    </v-form>
                                                </v-tab-item>
                                            </v-tabs-items>
                                        </div>

                                        <!-- Live Stream In Progress -->
                                        <div v-else>
                                            <v-tabs v-model="streamTab" class="stream-tabs" background-color="#fafafa"
                                                    fixed-tabs>
                                                <v-tab href="#connections">Connections</v-tab>
                                                <v-tab :disabled="!liveStreamReady" href="#preview">Live Preview</v-tab>
                                                <v-tab :disabled="!liveStreamReady" @click="setWowzaChart"
                                                       href="#options">Health
                                                </v-tab>
                                            </v-tabs>

                                            <div v-if="!liveStreamReady" class="mt-12 mb-8">
                                                <v-progress-linear indeterminate striped height="6"
                                                                   color="deep-orange"></v-progress-linear>
                                                <span>Setting up stream. You can preview and view options when ready.</span>
                                            </div>

                                            <v-tabs-items :value="streamTab">
                                                <v-tab-item value="connections">
                                                    <h6 class="mb-4">Scan for Larix</h6>
                                                    <qrcode-vue :value="liveSteramQr" size="180"></qrcode-vue>

                                                    <v-form class="connections-container">
                                                        <div class="text-left">
                                                            <h6>Register Connections</h6>
                                                        </div>
                                                        <v-text-field @click="copyText(connection.primaryServer)"
                                                                      label="RTMP" :value="connection.primaryServer"
                                                                      readonly>
                                                            <v-icon slot="append">mdi-clipboard</v-icon>
                                                        </v-text-field>
                                                        <v-text-field @click="copyText(connection.streamName)"
                                                                      label="Name" :value="connection.streamName"
                                                                      readonly>
                                                            <v-icon slot="append">mdi-clipboard</v-icon>
                                                        </v-text-field>
                                                        <v-text-field @click="copyText(connection.userName)"
                                                                      label="Username" :value="connection.userName"
                                                                      readonly>
                                                            <v-icon slot="append">mdi-clipboard</v-icon>
                                                        </v-text-field>
                                                        <v-text-field @click="copyText(connection.password)"
                                                                      label="Password" :value="connection.password"
                                                                      readonly>
                                                            <v-icon slot="append">mdi-clipboard</v-icon>
                                                        </v-text-field>

                                                        <v-btn block color="primary" class="mb-2">Save</v-btn>
                                                    </v-form>
                                                </v-tab-item>

                                                <v-tab-item value="preview">
                                                    <live-video-preview ref="livePreview" :service="service"/>
                                                    <div v-if="liveStreamStatus === 1" class="mt-8 mb-16">
                                                        <v-textarea v-model="previewText" outlined
                                                                    label="Preview text. Shown to users before stream is live."
                                                                    rows="2" class="mt-2"></v-textarea>
                                                        <div class=" mb-8" style="margin-top: -1rem">
                                                            <v-btn @click="updateLiveStatus(1)" block>save preview
                                                                text
                                                            </v-btn>
                                                        </div>

                                                        <v-btn @click="updateLiveStatus(2)" block color="primary">Go
                                                            live
                                                        </v-btn>
                                                        <small>Once you've confirmed the video. Please click Go Live to
                                                            stream to users</small>
                                                    </div>
                                                </v-tab-item>

                                                <v-tab-item value="options">
                                                    <wowza-event-chart :live="true" :token="token" ref="wowzaChart"/>
                                                </v-tab-item>
                                            </v-tabs-items>

                                            <v-btn @click="endLiveStream()" color="error" block large class="mt-4">
                                                <slash-icon size="1x" class="mr-2"></slash-icon>
                                                End Live Stream
                                            </v-btn>


                                        </div>
                                    </div>


                                    <!-- <div v-if="event.streamState === 3 && event.liveStreamId !== null" class="event-options text-center">
                                        <h5>stream completed</h5>
                                    </div> -->

                                    <!-- File uploader -->
                                    <!-- <UppyUploader v-show="!event.live && event.media.length < 15" :modelId="event.id" :clear="event.id" :data="event" :token="token" :serviceId="serviceId" @message="setSnackBar" @updateList="updateEventsMediaList"></UppyUploader> -->

                                    <!-- <v-divider v-if="!event.live && event.media.length < 15" /> -->

                                    <!-- <div v-if="!event.live && event.media.length < 15" class="d-flex">
                                        <v-textarea outlined v-model="event.convertedVideoLink" label="Converted Video URL" rows="2" class="mt-2"></v-textarea>
                                    </div> -->

                                    <!-- Upload progress -->
                                    <!-- <div v-show="!event.live">
                                        <v-progress-linear :value="(event.media.length / 15) * 100" class="mb-1"></v-progress-linear>
                                        <span :class="{ 'text-danger': event.media.length >= 15 }">{{ event.media.length }}/15 uploads</span>
                                    </div> -->

                                    <div v-if="!liveSteramQr.length" class="mt-6 mb-6">
                                        <!-- <v-btn v-if="!busy" block color="#0C3C60" dark large @click.prevent="saveEvent(event.id)">Save {{ event.title }}</v-btn>
                                        <v-btn v-else block large><v-progress-circular indeterminate color="primary"></v-progress-circular></v-btn> -->
                                        <v-btn v-if="!event.media.length"
                                               @click="openDeleteModal(event.id, false, event)" text block small
                                               class="mt-5">
                                            <trash-2-icon size="1x" class="mr-1"></trash-2-icon>
                                            delete
                                        </v-btn>
                                    </div>

                                    <div v-if="!event.live && event.media.length < 15" class="d-flex">
                                        <v-textarea outlined v-model="event.convertedVideoLink"
                                                    label="Converted Video URL" rows="2" class="mt-8"></v-textarea>
                                    </div>
                                </v-card-text>
                            </v-tab-item>

                            <v-tab-item value="manageMedia">
                                <v-card-text>
                                    <v-data-table
                                            :headers="headers"
                                            :items="event.media"
                                            :loading="loading"
                                            :server-items-length="event.media.length"
                                            loading-text="Getting Media..."
                                            hide-default-footer

                                            class="media-table">

                                        <template v-slot:item.thumbnail="{ item }">
                                            <img v-if="item.url" @click="expandMedia(item)" :src="item.url"
                                                 :alt="item.name" class="media-thumbnail"/>
                                        </template>

                                        <template v-slot:item.actions="{ item }">
                                            <v-tooltip bottom>
                                                <template v-slot:activator="{ on, attrs }">
                                                    <span v-bind="attrs" v-on="on" @click="openDeleteModal(item, true)">
                                                        <trash-2-icon size="1.25x"></trash-2-icon>
                                                    </span>
                                                </template>

                                                <span>Delete</span>
                                            </v-tooltip>

                                            <v-tooltip bottom>
                                                <template v-slot:activator="{ on, attrs }">
                                                    <span @click="expandMedia(item)" v-bind="attrs" v-on="on">
                                                        <eye-icon size="1.25x" class="ml-2"></eye-icon>
                                                    </span>
                                                </template>

                                                <span>View</span>
                                            </v-tooltip>
                                        </template>
                                    </v-data-table>
                                    <strong class="mt-4 d-inline-block">{{ event.media.length }} items</strong>
                                </v-card-text>
                            </v-tab-item>
                        </v-tabs-items>
                    </v-form>
                </div>

                <!-- Create new event -->
                <div v-if="tab === 99" class="tab-container">
                    <v-form ref="form" lazy-validation class="">
                        <h3>Add Event</h3>
                        <v-row>
                            <v-col>
                                <v-text-field v-model="createEvent.title" label="Title"
                                              :rules="[v => !!v || 'Title is required']"></v-text-field>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col>
                                <div v-bind:class="[{ 'invalid-input': createEvent.errors.includes('time') }, 'datetime-input']">
                                    <label for="serviceDate">Event Date & Time</label>
                                    <datetime id="serviceDate" :minute-step="15" placeholder="-- --" type="datetime"
                                              use12-hour v-model="createEvent.time" class="theme-orange"></datetime>
                                </div>
                                <div v-if="createEvent.errors.includes('time')" class="error-text">Date and Time are
                                    required
                                </div>
                            </v-col>
                        </v-row>

                        <v-col class="checkbox-area flex-row">
                            <v-checkbox v-model="createEvent.private" label="Private"></v-checkbox>
                            <v-checkbox v-model="createEvent.live" label="Live"></v-checkbox>
                        </v-col>

                        <!-- <UppyUploader v-show="!createEvent.live && tab === 99" :modelId="99" :clear="tab" :data="createEvent" :token="token" :serviceId="serviceId" @message="setSnackBar"></UppyUploader> -->

                        <div class="text-right mt-6 mb-6">
                            <button v-if="!busy" @click.prevent="saveEvent()" class="btn btn-primary ml-3 save-btn">Add
                                Event
                            </button>
                            <button v-else class="btn btn-light ml-3 save-btn">
                                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                            </button>
                        </div>
                    </v-form>
                </div>

            </div>

            <div v-if="editing" class="view-container">
                <h5>Embed code</h5>
                <embed-modal v-if="videoSlug" :slug="videoSlug"/>
            </div>

            <ServiceBillingCharts v-if="editing" :id="$route.params.id" :token="token" ref="billingCharts"/>
        </div>

        <img src="https://d1pnnwteuly8z3.cloudfront.net/images/1fde3b9d-4dc8-422c-8e23-bbe443fd0870/b2f06338-a853-4f8c-b19f-7265e27df50e.png"
             alt="family" class="corner-img">

        <v-snackbar v-model="snackbar" :timeout="3000">
            {{ message }}
        </v-snackbar>

        <v-dialog v-model="deleteModal" :retain-focus="false" max-width="290">
            <v-card>
                <v-card-title class="headline">Delete Event?</v-card-title>
                <v-card-text>{{ deleteMessage }}?</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="gdarken-1" text @click="deleteModal = false">cancel</v-btn>
                    <v-btn color="red darken-1" text @click="deleteEvent()">Delete</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="completeStreamDialog" :retain-focus="false" max-width="290">
            <v-card>
                <v-card-title class="headline">Complete Event</v-card-title>
                <v-card-text>Are you sure you want to mark this event as complete?</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="gdarken-1" text @click="completeStreamDialog = false">cancel</v-btn>
                    <v-btn color="red darken-1" @click="completeStreamDialog = false" text>Complete</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

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
            title: 'Manage Services',
        },
        data() {
            return {
                busy: false,
                pageTab: null,
                loading: false,
                snackbar: false,
                completeStreamDialog: false,
                message: '',
                editing: false,
                firstName: '',
                lastName: '',
                birthDate: '',
                deathDate: '',
                birthDateMenu: false,
                deathDateMenu: false,
                serviceDate: '',
                serviceTime: '',
                testService: false,
                embedCode: '',
                convertedVideoLink: '',
                showViewer: false,
                viewerSrc: {},
                serviceId: -1,
                tab: -1,
                enabled: true,
                token: '',
                hidePlaceholder: false,
                dragging: false,
                videoSlug: '',
                connection: {},
                createEvent: {
                    title: '',
                    time: '',
                    private: false,
                    live: false,
                    errors: [],
                    eventType: 4,
                },
                event: {
                    title: '',
                    time: '',
                    private: false,
                    live: false,
                    errors: [],
                    eventType: 0,
                    convertedVideoLink: '',
                    streamState: null,
                    hlsPlayerUrl: '',
                    pin: ''
                },
                streamTab: null,
                gettingStreamState: false,
                liveStreamReady: false,
                streamProgress: 0,
                deleteModal: false,
                requiredRules: [v => !!v || "This field is required"],
                eventEnum: [
                    'Visitation',
                    'Funeral',
                    'Graveside',
                    'Other'
                ],
                blobUrl: '',
                liveSteramQr: '',
                events: [],
                menuEventItems: [],
                deleteMessage: '',
                deleteItem: {},
                uploadingPlaceholderImg: false,
                selectedFile: '',
                streamStatus: ['Created', 'Streaming', 'Paused', 'Completed'],
                service: {},
                headers: [
                    {text: '', value: 'thumbnail', width: '10%'},
                    {text: 'Name', value: 'name'},
                    {text: 'Actions', value: 'actions', width: '20%'},
                ],
                streamInterval: '',
                monitorInterval: null,
                liveStreamStatus: 0,
                previewText: 'Stream starting soon'
            }
        },
        watch: {
            '$route.params': {
                handler(newValue) {
                    this.load()
                },
                immediate: true,
            },
            'events': {
                handler: function () {
                    this.sortItems();
                },
                immediate: true,
                deep: true
            },
            'streamTab': {
                handler: function () {
                    if (this.streamTab === 'preview') {
                        this.liveStreamStatus = 0;
                        this.monitorStreamStatus();

                        this.monitorInterval = setInterval(() => {
                            this.monitorStreamStatus();
                        }, 10000);

                    } else {
                        clearInterval(this.monitorInterval)
                    }

                    if (this.streamTab === 'options') {
                        if (this.liveSteramQr) {
                            this.streamInterval = setInterval(() => {
                                this.$refs.wowzaChart.getHealthRecords();
                            }, 30000);
                        }

                    } else {
                        clearInterval(this.streamInterval)
                    }
                },
                immediate: true,
                deep: true
            }

        },
        computed: {
            computedBirthDate() {
                return this.birthDate ? this.$moment(this.birthDate).format('MMMM Do YYYY') : ''
            },
            computedDeathDate() {
                return this.deathDate ? this.$moment(this.deathDate).format('MMMM Do YYYY') : ''
            },
        },
        methods: {
            allowedStep: m => m % 15 === 0,
            changeTab(tabIndex, item = {}) {
                // clear active from all tabs and reassign it
                this.events.forEach(el => {
                    el.active = false
                })
                this.tab = tabIndex;
                this.streamTab = -1;
                this.liveSteramQr = '';
                clearInterval(this.streamInterval)

                if (tabIndex === 0) {
                    this.event.title = item.title;
                    this.event.time = item.time;
                    this.event.private = item.private;
                    this.event.live = item.live;
                    this.event.id = item.id;
                    this.event.media = item.media;
                    this.event.convertedVideoLink = item.convertedVideo;
                    this.event.liveStreamId = item.liveStreamId;
                    this.event.pin = item.pin;
                    this.event.eventType = item.eventType;
                    item.active = true;
                    this.pageTab = 'details';
                    if (this.event.live) this.checkLiveStream()
                }
            },
            load() {
                this.events = [];

                if (+this.$route.params.id) {
                    this.serviceId = +this.$route.params.id;
                    this.loading = true;
                    this.editing = true;
                    this.getService(this.$route.params.id)
                } else {
                    this.changeTab(-1);

                    this.serviceId = null;
                    this.loading = false;
                    this.editing = false;

                    this.firstName = '';
                    this.lastName = '';
                    this.birthDate = this.$moment().subtract(70, 'years').toISOString().substr(0, 10);
                    this.deathDate = this.$moment().subtract(3, 'days').toISOString().substr(0, 10);
                    this.testService = false,
                        this.embedCode = '';
                }
            },
            getService(id) {
                this.$auth.getIdTokenClaims().then(result => {
                    this.token = result.__raw;
                    this.$refs.billingCharts.init(this.token);

                    this.axios
                        .create({headers: {'Authorization': `Bearer ${this.token}`}})
                        .get(process.env.VUE_APP_API + `/Services/${id}`)
                        .then(response => {
                            console.log('service')
                            console.log(response.data)
                            let result = response.data;
                            this.firstName = result.firstName;
                            this.lastName = result.lastName;
                            this.birthDate = result.birthDate;
                            this.deathDate = result.deathDate;
                            this.videoSlug = result.slug;
                            this.testService = result.test;
                            this.embedCode = "";
                            this.service = response.data;

                            // get events once
                            this.getEvents()
                        })
                        .catch(error => {
                            console.log(error)
                            console.log(error.response)
                            this.message = `Error! Unable to find service with id ${id}`
                            this.snackbar = true;
                            this.loading = false;
                        })
                });
            },
            getEvents(eventId = -1) {
                this.loading = true;
                this.events.splice(0);

                // item.eventType + 1 TO HIDE TRIBUTE

                this.axios
                    .create({headers: {'Authorization': `Bearer ${this.token}`}})
                    .get(process.env.VUE_APP_API + `/events/list/${this.serviceId}`)
                    .then(response => {
                        if (response.data) {
                            response.data.forEach((item, idx) => {
                                item.time = item.time !== '0001-01-01T00:00:00' ? item.time : '';
                                item.active = false;
                                // item.menuTitle = (item.eventType !== 4 && item.eventType !== 0 ? this.eventEnum[item.eventType - 1].replace(/([A-Z])/g, ' $1').trim() : this.truncate(item.title) );
                                item.menuTitle = item.title.replace(this.service.firstName + ' ' + this.service.lastName + '\'s ', '');
                                item.errors = [];
                                if (eventId > -1 && item.id === eventId) item.active = true;
                                if (item.eventType !== 0) this.events.push(item)
                            })

                            console.log('events')
                            console.log(this.events)
                        }
                    }).catch(error => {
                    console.log(error.reponse)
                    this.snackbar = true;
                    this.message = `Error! ${error.response}`;
                })
                    .then(() => {
                        this.loading = false;
                    })
            },
            saveService(payload) {
                this.busy = true;
                let valid = this.$refs.form.validate();

                if (valid) {
                    let query = process.env.VUE_APP_API + '/Services',
                        data = {
                            firstName: this.firstName,
                            lastName: this.lastName,
                            birthDate: this.$moment(this.birthDate).toISOString(),
                            deathDate: this.$moment(this.deathDate).toISOString(),
                            funeralHomeId: this.$auth.funeralHomeId,
                            test: this.testService
                        };

                    if (this.editing) {
                        query = `${query}/${this.serviceId}`;
                        data.id = this.serviceId;
                        data.pictureURL = this.blobUrl.length ? this.blobUrl.split('?')[0] : '';

                        this.axios
                            .create({headers: {'Authorization': `Bearer ${this.token}`}})
                            .put(query, data)
                            .then(response => {
                                this.message = `${this.firstName} ${this.lastName}'s service was successfully updated`;
                            })
                            .catch(error => {
                                console.log(error.response)
                                this.message = `Error! ${error.response}`;
                            }).then(() => {
                            this.snackbar = true;
                            this.busy = false;
                        })

                    } else {
                        // create new
                        this.$auth.getIdTokenClaims().then(result => {
                            this.token = result.__raw;

                            this.axios
                                .create({headers: {'Authorization': `Bearer ${this.token}`}})
                                .post(query, data)
                                .then(response => {
                                    this.initEvents(response.data.id, () => {

                                        this.message = `${this.firstName} ${this.lastName}'s services was successfully created`;
                                        this.snackbar = true;
                                        this.$router.push({name: 'EditServices', params: {id: response.data.id}})
                                        this.editing = true;
                                    })
                                })
                                .catch(error => {
                                    console.log(error)
                                    console.log(error.response)
                                    this.message = "Error! Please try again"
                                    this.snackbar = true;
                                }).then(() => {
                                this.busy = false;
                            })
                        });
                    }

                } else {
                    this.message = "Error! Please fix form errors"
                    this.snackbar = true;
                    this.busy = false;
                }
            },
            saveEvent() {
                this.busy = true;
                let event = this.tab === 99 ? this.createEvent : this.event;

                if (event.eventType === 0) {
                    event.time = '0001-01-01T00:00:00'
                } else {
                    if (event.time) {
                        this.$moment(event.time).local().format('YYYY-MM-DDTHH:mm:ss.SSSS')
                    }
                }

                let data = {
                    title: event.title,
                    time: event.time,
                    live: event.eventType === 0 ? false : event.live,
                    private: event.private,
                    serviceId: this.serviceId,
                    eventType: event.eventType,
                    convertedVideo: event.live ? null : event.convertedVideoLink
                }

                // validate
                event.errors = [];
                this.$refs.form.validate();

                // see if title already exists
                let titleIsUnique = true;
                this.events.forEach(item => {
                    if (event.id !== item.id && data.title.toLowerCase() === item.title.toLowerCase()) {
                        return titleIsUnique = false;
                    }
                });

                if (!titleIsUnique) {
                    this.busy = false;
                    this.setSnackBar(`Event '${data.title}' already exists. Please change title.`)
                    return;
                }

                for (const [key, value] of Object.entries(data)) {
                    if (key !== 'errors' && value === '') {
                        event.errors.push(key)
                    }
                }

                if (event.errors.length > 0) {
                    this.busy = false;
                    this.snackbar = true;
                    this.message = `Please fix form errors! ${event.errors.join(', ')} are required`
                    return;
                }

                // valid
                this.loading = true;
                if (event.id) {
                    // update event
                    data.id = event.id;
                    delete data.eventType;

                    this.axios
                        .create({headers: {'Authorization': `Bearer ${this.token}`}})
                        .put(process.env.VUE_APP_API + `/Events/${event.id}`, data).then(response => {
                        // TODO update this message later
                        this.message = `${event.title} successfully updated`;
                        this.getEvents(event.id);

                        if (event.live) {
                            this.event.liveStreamId = response.data.liveStreamId;
                            this.event.streamState = 0;
                            this.event.hlsPlayerUrl = '';
                        }
                    }).catch(error => {
                        console.log(error)
                        console.log(error.response)
                        this.message = `Error updating ${event.title}`;
                    }).then(() => {
                        this.snackbar = true;
                        this.busy = false
                        this.loading = false;
                    })

                } else {
                    // create new event
                    this.axios
                        .create({headers: {'Authorization': `Bearer ${this.token}`}})
                        .post(process.env.VUE_APP_API + '/Events', data).then(response => {
                        this.message = `${data.title} successfully created`;
                        let item = response.data;
                        item.menuTitle = this.truncate(item.title)
                        item.errors = [];
                        item.media = [];
                        this.events.push(item);
                        this.changeTab(0, item)

                    }).catch(error => {
                        console.log(error)
                        console.log(error.response)
                        this.message = `Error creating ${this.eventEnum[data.eventType]}`
                    }).then(() => {
                        this.snackbar = true;
                        this.busy = false
                        this.loading = false;
                        //this.getEvents();
                    })
                }
            },
            updateEventsMediaList(updatedArr) {
                this.event.media = updatedArr;
            },
            openDeleteModal(eventId, media = false, eventObj = false) {
                if (eventObj && !eventObj.time) {
                    this.deleteItem = eventObj;
                    this.deleteEvent();
                    return
                }

                if (!media) {
                    this.deleteItem = this.events.find(item => item.id === eventId);
                    this.deleteMessage = `Are you sure you want to delete ${this.deleteItem.title.length ? this.deleteItem.title : this.eventEnum[this.deleteItem.eventType]} event`;
                } else {
                    this.deleteItem = eventId;
                    console.log(this.deleteItem)
                    this.deleteMessage = `Are you sure you want to delete ${this.deleteItem.name}`;

                }

                this.deleteModal = true;
            },
            deleteEvent() {
                this.busy = true;

                // check if this is an event or media item
                if ('mediaType' in this.deleteItem) {
                    // is media
                    this.axios
                        .create({headers: {'Authorization': `Bearer ${this.token}`}})
                        .post(process.env.VUE_APP_API + `/events/deletemedia/${this.deleteItem.id}`)
                        .then(response => {
                            console.log(response)
                            this.message = `${this.deleteItem.name} was successfully deleted`;

                            // remove deleted item from list
                            let index = this.event.media.findIndex(item => item.id === this.deleteItem.id);
                            this.event.media.splice(index, 1)

                            if (!this.event.media.length) this.pageTab = 'details';
                        }).catch(error => {
                        console.log(error)
                        console.log(error.response)
                        this.message = `Error deleting ${this.deleteItem.name}`
                    }).then(() => {
                        this.snackbar = true;
                        this.busy = false
                        this.deleteModal = false;
                    })
                } else {
                    // is event
                    this.axios
                        .create({headers: {'Authorization': `Bearer ${this.token}`}})
                        .delete(process.env.VUE_APP_API + `/Events/${this.deleteItem.id}`)
                        .then(response => {
                            console.log(response)
                            this.message = `${this.deleteItem.title.length ? this.deleteItem.title : this.eventEnum[this.deleteItem.eventType]} was successfully deleted`;
                            this.load();
                            this.changeTab(-1);
                        }).catch(error => {
                        console.log(error)
                        console.log(error.response)
                        this.message = `Error deleting ${this.deleteItem.title.length ? this.deleteItem.title : this.eventEnum[this.deleteItem.eventType]}`
                    }).then(() => {
                        this.snackbar = true;
                        this.busy = false
                        this.deleteModal = false;
                    })
                }
            },
            expandMedia(media) {
                this.showViewer = !this.showViewer;

                if (this.showViewer) {
                    if (media) {
                        this.viewerSrc = media;
                    }

                }
            },
            checkLiveStream() {
                this.gettingStreamState = true;
                this.axios
                    .create({headers: {'Authorization': `Bearer ${this.token}`}})
                    .get(process.env.VUE_APP_API + `/live/${this.event.liveStreamId}`)
                    .then(response => {
                        // state 0: Created, 1: Streaming, 2: Paused, 3: Completed
                        console.log('-- checking stream status --');
                        console.log(response.data)
                        this.connection = response.data;
                        this.event.streamState = response.data.state;
                        switch (this.event.streamState) {
                            case 0:
                                console.log('stream created')
                                break;
                            case 1:
                                console.log('stream in progress')
                                this.startLiveStream(false);
                                break;
                            case 2:
                                console.log('stream paused')
                                break;
                            case 3:
                                console.log('stream complete')
                                break;
                        }

                        this.gettingStreamState = false;
                        console.log(this.event)
                    })
            },
            updateLiveStatus(status) {
                this.axios
                    .create({headers: {'Authorization': `Bearer ${this.token}`}})
                    .post(process.env.VUE_APP_API + `/events/live/update-status/${+this.event.id}?previewText=${this.previewText}&eventStatus=${status}`)
                    .then(response => {
                        this.liveStreamStatus = status
                    })
                    .catch(error => {
                        console.log(error)
                    })
            },
            startLiveStream(loading = true) {
                // display preview message is setting is applied
                console.log('skip live ' + this.service.skipLivePreview)
                if (this.service.skipLivePreview) {
                    this.updateLiveStatus(1)
                }

                // get stream params
                this.axios
                    .create({headers: {'Authorization': `Bearer ${this.token}`}})
                    .get(process.env.VUE_APP_API + `/live/${this.event.liveStreamId}`)
                    .then(response => {
                        console.log(response)
                        const stream = response.data,
                            url = encodeURIComponent(stream.primaryServer + '/' + stream.streamName)

                        this.event.hlsPlayerUrl = response.data.hlsPlayerUrl;
                        this.liveSteramQr = `larix://set/v1?conn[][url]=${url}&conn[][name]=stream&conn[][mode]=av&conn[][user]=${stream.userName}&conn[][pass]=${stream.password}&conn[][target]=rtmp`

                        // start wowza
                        if (loading) {
                            this.axios
                                .create({headers: {'Authorization': `Bearer ${this.token}`}})
                                .post(process.env.VUE_APP_API + `/live/start/${this.event.liveStreamId}`)
                                .then(response => {
                                    console.log('--- live streaming ---')
                                    this.triggerLiveStream();
                                })
                                .catch(error => {
                                    console.log(error);
                                    this.setSnackBar('Error starting stream')
                                    // just incase
                                    this.endLiveStream();
                                })
                        } else {
                            this.$store.dispatch('toggleStreaming', true);
                            this.liveStreamReady = true;
                        }
                    })
                    .catch(error => {
                        console.log(error)
                    })
            },
            triggerLiveStream() {
                this.setSnackBar('Preparing live stream');
                this.liveStreamReady = false;
                this.streamProgress = 0;

                const interval = setInterval(() => {
                    this.axios
                        .create({headers: {'Authorization': `Bearer ${this.token}`}})
                        .get(process.env.VUE_APP_API + `/live/get-live-health-chart/${this.event.liveStreamId}`)
                        .then(response => {
                            if (response.data) {
                                clearInterval(interval)
                                this.setSnackBar('Live Stream Ready');
                                this.$store.dispatch('toggleStreaming', true);
                                this.liveStreamReady = true;
                                this.streamTab = 'preview';
                            }

                        })
                        .catch(error => {
                            console.log(error)
                            clearInterval(interval)
                        })
                }, 10000)
            },
            endLiveStream() {
                this.gettingStreamState = true;
                // end stream
                this.axios
                    .create({headers: {'Authorization': `Bearer ${this.token}`}})
                    .post(process.env.VUE_APP_API + `/live/stop/${this.event.liveStreamId}`)
                    .then(response => {
                        console.log('--- end streaming ---')
                        this.$store.dispatch('toggleStreaming', false);
                        this.setSnackBar('Live streaming ended')
                        this.event.streamState = 2;
                        this.streamTab = -1;
                    })
                    .catch(error => {
                        console.log(error);
                        console.log(error.response)
                        this.setSnackBar('Error ending stream')
                    })
                    .then(() => {
                        this.gettingStreamState = false;
                    })

                this.$store.dispatch('toggleStreaming');
                this.liveSteramQr = '';
            },
            monitorStreamStatus() {
                // liveStreamStatus 0 - no 1 - live
                this.axios
                    .create({headers: {'Authorization': `Bearer ${this.token}`}})
                    .get(process.env.VUE_APP_API + `/live/get-live-health-chart/${this.event.liveStreamId}`)
                    .then(response => {
                        if (response.data) {
                            if (response.data.current.connected.value === 'Yes') {
                                this.liveStreamStatus = 1;
                                if (this.$refs.livePreview) {
                                    this.$refs.livePreview.loading = false;
                                    this.$refs.livePreview.init();
                                }
                            }
                        }

                    })
                    .catch(error => {
                        console.log(error)

                        //temp
                        clearInterval(interval)
                        this.liveStreamStatus = 1;
                    })
            },
            markStreamAsComplete() {
                this.axios
                    .create({headers: {'Authorization': `Bearer ${this.token}`}})
                    .post(process.env.VUE_APP_API + `/events/live/update-status/${this.event.id}`, {
                        eventStatus: 1
                    })
                    .then(response => {
                        console.log(response)
                    })
                    .catch(error => {
                        console.log(error)
                    })
            },
            initEvents(serviceId, callback) {
                // -1 to avoid create 'other'
                // EVENT TYPE IS + 1 TO HIDE TRIBUTE
                for (let i = 0; i < (this.eventEnum.length - 1); i++) {
                    let data = {
                        title: `${this.firstName} ${this.lastName}'s ${this.eventEnum[i].replace(/([A-Z])/g, ' $1').trim()}`,
                        eventType: i + 1,
                        private: false,
                        live: false,
                        serviceId: serviceId,
                        order: i
                    }
                    console.log(data)

                    this.axios
                        .create({headers: {'Authorization': `Bearer ${this.token}`}})
                        .post(process.env.VUE_APP_API + '/Events', data)
                        .then(response => {
                            console.log(`${response.data.title} created`)
                            if (i === this.eventEnum.length - 2) callback();
                        }).catch(error => {
                        console.log(error)
                        console.log(error.response)
                    })
                }
            },
            truncate(input) {
                if (input.length > 16) {
                    return input.substring(0, 16) + '..';
                }
                return input;
            },
            setSnackBar(message) {
                this.message = message;
                this.snackbar = true;
            },
            goToVideo() {
                // temp
                this.$store.dispatch('setVideoSrc', this.event.convertedVideoLink);
                this.$router.push({path: `/services/view/${this.videoSlug}`})
            },
            goToVideoUploader() {
                this.$router.push({path: `/manage-services/upload/${this.event.id}`})
            },
            sortItems: function () {
                let sorted = this.events.slice().sort(function compare(a, b) {
                    var dateA = new Date(a.time);
                    var dateB = new Date(b.time);
                    if (dateA.length || dateB.length) {
                        return dateA - dateB
                    } else {
                        return a.order - b.order
                    }

                });

                // sorted = this.events.slice().sort(function compare(a, b) {
                //     return a.eventType - b.eventType;
                // });

                // HIDE TRIBUTE
                // let tribute = sorted.find(x => x.eventType === 0);
                // if (tribute) {
                //     sorted = sorted.filter(x => x.eventType !== 0)
                //     sorted.unshift(tribute)
                // }
                return sorted;
            },
            copyText(text) {
                const el = document.createElement('textarea');
                el.value = text
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
                this.setSnackBar('Text copied')
            },
            onFileSelected(event) {
                let _ = this;
                this.selectedFile = event.target.files[0];

                let reader = new FileReader();

                reader.addEventListener("load", function () {
                    _.uploadingPlaceholderImg = true;
                    // convert image file to base64 string
                    _.hidePlaceholder = true;
                    console.log(reader.result)
                    _.$refs.preview.src = reader.result;
                    _.baseImg = reader.result;
                    _.viewerSrc = reader.result;

                    _.axios
                        .create({headers: {'Authorization': `Bearer ${_.token}`}})
                        .get(process.env.VUE_APP_API + '/services/picture-sas')
                        .then(response => {
                            console.log(response)
                            _.blobUrl = response.data
                            _.savePlaceHolderImg(response.data)

                        })
                        .catch(error => {
                            console.log(error)
                        })
                }, false);

                if (this.selectedFile) {
                    reader.readAsDataURL(this.selectedFile);
                }
            },
            setWowzaChart() {
                setTimeout(() => {
                    this.$refs.wowzaChart.event = this.event;
                    this.$refs.wowzaChart.init();
                })
            },
            savePlaceHolderImg() {
                console.log('----')
                let _ = this;
                let reader = new FileReader();
                reader.readAsArrayBuffer(this.selectedFile);
                console.log(reader.result)
                reader.addEventListener("load", function () {
                    _.axios
                        .create({
                            headers: {
                                'Content-Type': _.selectedFile.type,
                                'x-ms-blob-type': 'BlockBlob'
                            }
                        })
                        .put(_.blobUrl, reader.result)
                        .then(response => {
                            console.log(response)
                        })
                        .catch(error => {
                            console.log(error)
                        })
                        .then(() => {
                            _.uploadingPlaceholderImg = false;
                        })
                });
            },
        },
        components: {
            Spinner,
            PlusIcon,
            draggable,
            UppyUploader,
            SlashIcon,
            Trash2Icon,
            EyeIcon,
            Viewer,
            PlayIcon,
            XCircleIcon,
            SquareIcon,
            QrcodeVue,
            VideoPlayer,
            CheckIcon,
            BarChartIcon,
            ArrowLeftIcon,
            CopyIcon,
            CodeIcon,
            EmbedModal,
            UploadIcon,
            UserIcon,
            LiveVideoPreview,
            UppyModal,
            FileTextIcon,
            ServiceBillingCharts,
            WowzaEventChart,
            VideoIcon
        },
    }
</script>

<style lang="scss" scoped>
    .dash-container {
        background: url('https://d1pnnwteuly8z3.cloudfront.net/images/1fde3b9d-4dc8-422c-8e23-bbe443fd0870/3db295f3-24bb-4347-8d2e-c58abfeb92aa.svg') no-repeat 0 -18rem;
    }

    .view-container {
        width: 64vw;
        margin: auto;
        // text-align: center;
        position: relative;
        background: #fff;
        z-index: 1;
    }

    .tab-nav {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        padding: 0;
        margin: 0;
        width: 16rem;
        overflow-y: auto;

        &::-webkit-scrollbar {
            width: 2px;
        }

        .tab-list {
            position: absolute;
            width: 14rem;
            background: #f8f8f8;
            padding: 2rem 0;
            margin: 0;
            height: 100%;
            bottom: 0;
            border-right: 1px solid #f2f2f2;
        }

        .dragable-list {
            padding: 0;
        }

        ul {
            padding: 0;
        }

        li {
            background: #f8f8f8;
            list-style: none;
            padding: 1rem 1.5rem;
            margin: 0;
            cursor: pointer;
            position: relative;
            transition: .3s ease-in-out;

            &:focus {
                outline: none;
            }

            .dot {
                height: .6rem;
                width: .6rem;
                display: inline-block;
                background: #dfdfdf;
                margin-right: .5rem;
                border-radius: 50%;

                &.live {
                    background: rgba(255, 82, 82, 1);
                    box-shadow: 0 0 0 0 rgba(255, 82, 82, 1);
                    animation: pulse-red 2s infinite;
                }
            }

            .complete {
                background: #44ea11;
            }

            &:hover {
                background: #e8e8e8;
            }
        }

        .active {
            background: #90A6B6;
            color: #fff;
            font-weight: 600;
            position: relative;
            z-index: 2;

            &:after {
                content: '';
                position: absolute;
                left: 87%;
                top: 0;
                height: 100%;
                width: 3rem;
                background: #90A6B6;
                border-radius: 50%;
                z-index: 1;
            }

            .add-icon {
                color: #fff;
            }

            &:hover {
                background: #90A6B6;
            }
        }

        .delete-icon {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            right: -.5rem;
            z-index: 2;
            color: #ba3131;
        }
    }

    .menu-placeholder-container {
        background: #f8f8f8;
        padding: .5rem 1rem;
        border-radius: 12px;
        cursor: pointer;

        .menu-placeholder {
            height: 6rem;
            width: 6rem;
            border-radius: 50%;
            border: .5rem solid #dfdfdf;
            background: #f8f8f8;
            display: inline-block;
            vertical-align: middle;
            margin-right: 1rem;
            line-height: 5rem;
            text-align: center;

            svg {
                opacity: .5;
            }
        }

        .preview-menu-placeholder {
            height: 6rem;
            width: 6rem;
            border-radius: 50%;
            object-fit: cover;
            margin-right: 1rem;
        }
    }

    .tab-container {
        padding: 0 4rem 0 2rem;
        min-height: 24rem;
        transition: .3s ease-in-out;

        .row {
            margin-top: .75rem;
        }
    }

    .tile {
        position: relative;
        padding: 2rem 4rem;
        width: 64vw;
        box-shadow: 0 0 1rem #666;
        z-index: 2;
        transition: .3s ease-in-out;

        &.edit {
            padding: 3rem 0 3rem 14rem;
        }
    }

    .row {
        margin-top: 1.5rem;
    }

    .custom-checkbox {
        margin-top: 1rem;
    }

    .event-options .theme--light.v-tabs-items {
        min-height: 4rem;
    }

    .save-btn {
        width: 40%;
    }

    .v-picker {
        width: 100%;
    }

    .datetime-input {
        border-bottom: 1px solid rgba(0, 0, 0, .42);

        label {
            font-size: .75rem;
            color: rgba(0, 0, 0, .6);
            margin-bottom: 0;
        }
    }

    .edit-title {
        padding: 0 8rem;
        margin: 1rem 0;

        h2 {
            color: #fff;
            text-shadow: 1px 1px #333;
        }
    }

    .corner-img {
        width: 30rem;
        height: auto;
        position: fixed;
        bottom: -5rem;
        right: -5rem;
        z-index: 0;
        transition: .3s ease-in-out;
    }

    .checkbox-area {
        background: #f8f8f8;
        border-radius: 2px;
        padding: 0 1rem;

        .v-input {
            width: 50%;
            display: inline-block;
        }
    }

    .flex-row {
        flex-direction: row;
    }

    form {
        width: 90%;
        padding-left: 2rem;
        margin: 0 auto;
    }

    .invalid-input {
        border-color: #ff5252;

        label {
            color: #ff5252;
        }
    }

    .error-text {
        color: #ff5252;
        font-size: 12px;
    }

    .add-icon {
        margin-left: -.2rem;
        margin-right: .4rem;
        color: #666;
    }

    .ghost {
        opacity: .9;
    }

    .media-list {
        list-style: none;
        padding: 0;
        margin: 1rem 0;
        background: #fafafa;
        padding: 1rem 0;

        li {
            padding: 1rem;
        }
    }

    .dash-container .v-data-table {
        min-height: 16rem;
        padding: 0;
    }

    .media-thumbnail {
        width: 3rem;
    }

    .event-options {
        background: #fafafa;
        padding: 1rem;
        margin-bottom: 3rem;
    }

    .stream-tabs {
        margin: 1rem 0 1rem;
    }

    .event-options .theme--light.v-tabs-items {
        background: #fafafa !important;
        padding: 1rem 2rem;
    }

    .service-item {
        padding: 1.5rem !important;
        background: #eee !important;

        &.active {
            background: #90A6B6 !important;
        }
    }

    .text-callout {
        background: #2275d7;
        color: #fff;
        border-radius: 5px;
        padding: .2rem .5rem;
        opacity: .9;
        display: inline-block;
        font-size: .7rem;
        vertical-align: middle;
    }

    .connections-container {
        border: 1px solid #d8d8d8;
        margin-top: 1rem;
        width: 100%;
        padding: 1.5rem 1rem;
        border-radius: 5px;
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
