import { createApp } from 'vue';
const app = createApp({});
app.component('remote-script', {
  props: {
    src: {
      type: String,
      required: true
    }
  },
  setup(props, { emit }) {
    const loadHandler = (event) => {
      emit('load', event);
    };
    const errorHandler = (event) => {
      emit('error', event);
    };
    const readyStateChangeHandler = (event) => {
      if (event.target.readyState === 'complete') {
        emit('load', event);
      }
    };

    return { loadHandler, errorHandler, readyStateChangeHandler };
  },
  render() {
    const self = this;
    return h('script', {
      type: 'text/javascript',
      src: this.src,
      onLoad: this.loadHandler,
      onError: this.errorHandler,
      onreadystatechange: this.readyStateChangeHandler
    });
  }
});

app.mount('#app');
