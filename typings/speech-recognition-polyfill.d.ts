declare module 'speech-recognition-polyfill' {
    const createPolyfill: (win: Window) => any;
    export = createPolyfill;
  }