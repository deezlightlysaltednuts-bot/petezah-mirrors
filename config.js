let stream = 'wss://wisp.mercurywork.shop/';
try {
  var id = localStorage.getItem('selectedVpnRegion') || 'default';
  var custom = (localStorage.getItem('proxServer') || '').trim();
  if (id === 'custom') {
    var cu = new URL(custom);
    if ((cu.protocol === 'wss:' || cu.protocol === 'ws:') && custom.charAt(custom.length - 1) === '/') stream = custom;
  } else if (id === 'anura' || id === '1' || id === 'vip-turbo') {
    stream = 'wss://anura.pro/wisp/';
  }
} catch (e) {}

let _CONFIG = {
  streamurl: stream,
  bareurl: 'https://wisp.mercurywork.shop/'
};
