import { getInstance } from "./index";
import store from '../store/index';


export const authGuard = (to, from, next) => {
  const authService = getInstance();

  const fn = () => {
    // If the user is authenticated, continue with the route
    if (authService.isAuthenticated) {
      if (to.meta.admin) {
        if (authService.role === 'SuperAdmin') {
          return next()
        } else {
          return next('/')
        }
      }

      if (to.name === 'View' || to.name === 'CreateUser') {
        store.dispatch('toggleTopNav', false);
      } else if (!store.state.topNavShowing) {
        store.dispatch('toggleTopNav', true);
      }

      if (to.meta.admin) {
        // protected
        if (authService.role === 'SuperAdmin') {
          return next();
        } else {
          // route to 404
        }
      } else {
        return next();
      }
    } else {
      // Otherwise, log in
      if (to.name === 'View' || to.name === 'CreateUser') {
        authService.isAuthenticated = true;
        return next();
      } else {
        authService.loginWithRedirect({ appState: { targetUrl: to.fullPath } });
      }
    }
  };

  // If loading has already finished, check our auth state using `fn()`
  if (!authService.loading) {
    return fn();
  }

  // Watch for the loading property to change before we check isAuthenticated
  authService.$watch("loading", loading => {
    if (loading === false) {
      return fn();
    }
  });
};