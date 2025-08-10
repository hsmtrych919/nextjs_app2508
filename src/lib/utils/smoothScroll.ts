const SmoothScroll = require('smooth-scroll/dist/smooth-scroll.min') as any;

export function smoothScroll() {
  // if (typeof window !== 'undefined') {
  let options = {
    speed: 150,
    easing: 'easeOutCubic',
    offset: 0
    // offset: 50
    // offset: function () { return (window.innerWidth > 896) ? 0 : 50; },
  };
  new SmoothScroll('a[href*="#"]', options);
// }
}
