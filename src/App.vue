<template>
  <v-app id="app">
    <Navbar></Navbar>
    <router-view />
  </v-app>
</template>

<script>
  import Navbar from '@/components/layout/Navbar.vue';

  export default {
    metaInfo: {
      titleTemplate: '%s | MemoryShare'
    },
    components: {
      Navbar,
    },
  }
</script>

<style lang="scss">
* {
  box-sizing: border-box;
}

h4 {
  margin: 0;
}

body {
   padding: 0;
  margin: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  padding: 0;
  margin: 0;
}

.pointer, .cursor {
  cursor: pointer;
}

.dialog-container {
    padding: 1.5rem 2rem !important;
  }

.custom-dialog {

  .header {
        padding: 1.75rem 2rem 0;

        h4 {
            margin-bottom: 0;
        }

        small {
            opacity: .7;
        }
    }

    .billing-form {
        margin-top: -1rem;
    }

    .content {
        padding: 1rem 2rem;
    }

    label {
        margin-bottom: 0;
    }
}

.ease {
  transition: .3s ease-in-out;
}

.flex-1 {
  flex: 1;
}

.flex-2 {
  flex: 2;
}

.page-container {
  padding: 1rem;
}

.auth-view {
  background: #f8f8f8;
}

.auth-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 28vw;
  padding: 2rem 1.5rem;
  border: 1px solid #d8d8d8;
  border-radius: 5px;
}

.dash-container {
    margin-left: 4rem;
    padding: 5rem 3rem 1.5rem;
    background-color: rgb(241, 244, 247);
    min-height: 100vh;
    transition: .1s linear;

    &.menu-showing {
      margin-left: 18rem;
    }

    .header {
      display: flex;
      margin-bottom: 2rem;
    }

    .title {
      display: inline-block;
      margin: .8rem 0 0;
    }

    .search-icon {
      margin: 0 1rem .2rem 0;
      height: 1.2rem;
    }

    .search-field {
      background: #fff;
      // width: 12rem;
      padding: .25rem 1rem;
      border: 1px solid rgba(192,195,197, .5);
      border-radius: 1.4rem;
      box-shadow: 0 0 4px rgba(192,195,197, .3);

      input {
        border: none;
        width: 16rem;
        height: 100%;

        &:focus {
          outline: none;
        }
      }
    }

    .tile {
      background: #fff;
      padding: 1.5rem;
      border-radius: 3px;
      box-shadow: 0 2px 8px rgba(192,195,197, .3);
    }

    .vdatetime-input {
      border: none;
      width: 100%;
    }

    .v-input__slot label {
      margin-bottom: 0;
    }

    .btn.btn-primary {
      color: #fff;
      background: #0C3C60;
      border-color: #0C3C60;

      &:hover {
        opacity: .9;
      }
    }

    .btn.btn-secondary {
      color: #fff;
      background: #FF530D;
      border-color: #FF530D;
    }

    .btn.btn-gradient {
      color: #fff;
      background: linear-gradient(90deg, rgba(238,63,70,1) 0%, rgba(244,125,35,1) 100%) !important;
      border: none;
    }

    .btn:hover {
      opacity: .9;
    }

    .v-card {
    margin-top: 2rem;
}

.v-data-table {
    min-height: 24rem;
    padding: 0 1rem;
    margin-top: 1rem;
}

.action-list svg {
    margin-right: .75rem;
}
}

.theme-orange .vdatetime-popup__header,
.theme-orange .vdatetime-calendar__month__day--selected > span > span,
.theme-orange .vdatetime-calendar__month__day--selected:hover > span > span {
  background: #FF530D;
}

.theme-orange .vdatetime-year-picker__item--selected,
.theme-orange .vdatetime-time-picker__item--selected,
.theme-orange .vdatetime-popup__actions__button {
  color: #FF530D;
}

  .disabled {
    opacity: .3;
  }

  .tile.form {
      width: 85%;
      margin: 2rem auto;
  }

  .form-container {
      padding: 2rem 4rem;
  }

  .chart-container {
        margin: 2rem 0;
    }

  .chart {
      background: #fff;
      padding: 2rem;
      border-radius: 5px;
  }

  .chart-title {
      border-left: 2px solid rgba(224,0,0, .7);
      border-radius: 1px;
      padding: 0 .5rem;
      margin: 0;
      display: inline-block;

    &.weekly {
      border-color: rgba(255,83,13,.7);
    }

    &.yearly {
      border-color: rgba(171,6,88,.7);
    }
  }

  .v-radio {
    &:first-of-type {
      margin-bottom: 1rem !important;
    }
    
    .v-label {
      margin-bottom: .1rem;
    }
  }

  .v-input--checkbox {
    .v-label {
      margin-bottom: 0;
    }
  }

  table {
    td {
      cursor: default;
    }
  }
</style>