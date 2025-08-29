// Polyfill for libraries expecting Node-style global in browser (e.g., sockjs-client)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(function attachGlobalShim(win: any) {
  if (typeof win !== 'undefined' && typeof (win as any).global === 'undefined') {
    (win as any).global = win;
  }
})(window as any);


