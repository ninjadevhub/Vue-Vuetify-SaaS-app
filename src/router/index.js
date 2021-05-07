import Vue from 'vue'
import VueRouter from 'vue-router'
import Services from "../views/Services.vue";
import ManageServices from "../views/ManageServices.vue";
import ManageHomes from "../views/ManageHomes.vue";
import Analytics from "../views/Analytics.vue";
import Homes from "../views/Homes.vue";
import Users from "../views/Users.vue";
import Owners from "../views/Owners.vue";
import ManageUsers from "../views/ManageUsers.vue";
import CreateUser from "../views/CreateUser.vue";
import Settings from "../views/Settings.vue";
import Feedback from "../views/Feedback.vue";
import View from "../views/View.vue";
import ManageComments from "../views/ManageComments.vue";
import Streams from '../views/Streams.vue';
import Billing from '../views/Billing.vue';
import AdminSettings from '../views/AdminSettings.vue';
import LiveDashboard from '../views/LiveDashboard.vue';
import Uploader from '../views/Uploader.vue';

import { authGuard } from "../auth/authGuard";

Vue.use(VueRouter)

const routes = [
  {
    path: "/",
    redirect: '/services',
    beforeEnter: authGuard
  },
  {
    path: "/services",
    name: "Services",
    component: Services,
    beforeEnter: authGuard
  },
  {
    path: "/manage-services",
    name: "ManageServices",
    component: ManageServices,
    beforeEnter: authGuard
  },
  {
    path: "/manage-services/comments/:id",
    name: "ManageComments",
    component: ManageComments,
    beforeEnter: authGuard
  },
  {
    path: "/manage-services/:id",
    name: "EditServices",
    component: ManageServices,
    beforeEnter: authGuard
  },
  {
    path: "/manage-services/billing/:id",
    name: "Billing",
    component: Billing,
    beforeEnter: authGuard
  },
  {
    path: "/services/view/:slug",
    name: "View",
    component: View,
    beforeEnter: authGuard
  },
  {
    path: "/manage-services/upload/:id",
    name: "Uploader",
    component: Uploader,
    beforeEnter: authGuard
  },
  {
    path: "/analytics",
    name: "Analytics",
    component: Analytics,
    beforeEnter: authGuard
  },
  {
    path: "/analytics/:id",
    name: "ServiceAnalytics",
    component: Analytics,
    beforeEnter: authGuard
  },
  {
    path: "/homes",
    name: "Homes",
    component: Homes,
    meta: { admin: true },
    beforeEnter: authGuard
  },
  {
    path: "/owners",
    name: "Owners",
    component: Owners,
    meta: { admin: true },
    beforeEnter: authGuard
  },
  {
    path: "/manage-homes/:id",
    name: 'EditHomes',
    component: ManageHomes,
    meta: { admin: true },
    beforeEnter: authGuard
  },
  {
    path: "/manage-homes",
    name: "ManageHomes",
    component: ManageHomes,
    meta: { admin: true },
    beforeEnter: authGuard
  },
  {
    path: "/users",
    name: "Users",
    component: Users,
    beforeEnter: authGuard
  },
  {
    path: "/users/:id",
    name: "ViewUsers",
    component: Users,
    beforeEnter: authGuard
  },
  {
    path: "/manage-users/create",
    name: "ManageUsers",
    component: ManageUsers,
    meta: { admin: true },
    beforeEnter: authGuard
  },
  {
    path: "/manage-users/edit/:id",
    name: "EditUsers",
    component: ManageUsers,
    meta: { admin: true },
    beforeEnter: authGuard
  },
  {
    path: "/accept",
    name: "CreateUser",
    component: CreateUser,
    meta: { admin: true },
    beforeEnter: authGuard
  },
  {
    path: "/settings",
    name: "Settings",
    component: Settings,
    beforeEnter: authGuard
  },
  {
    path: "/stream/:id",
    name: "Streams",
    component: Streams,
    beforeEnter: authGuard
  },
  {
    path: "/feedback",
    name: "Feedback",
    component: Feedback,
    beforeEnter: authGuard
  },
  {
    path: "/admin-settings/:id",
    name: "AdminSettings",
    component: AdminSettings,
    meta: { admin: true },
    beforeEnter: authGuard
  },
  {
    path: "/dashboard/live",
    name: "LiveDashboard",
    component: LiveDashboard,
    beforeEnter: authGuard
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
