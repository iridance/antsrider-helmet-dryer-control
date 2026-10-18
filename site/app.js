const SERVICE = 0xFFF0, WRITE_CHAR = 0xFFF1, NOTIFY_CHAR = 0xFFF2;
const FAN_OPTIONS = [1,2,3,4,5,6,7,8,9,10];
const TIME_OPTIONS = [0,5,10,15,20,30,45,60,90,120,180,240];
const $ = id => document.getElementById(id);

const I18N = {
 zh: {title:'安全帽風乾消毒機',conn:'連線',off:'尚未連線',connect:'連線設備',disconnect:'中斷連線',auto:'自動',autoDesc:'開啟頁面或斷線後，設備在附近時自動連上',autoLock:'請先手動連線一次，成功後即可啟用',clear:'清除',start:'開啟',stop:'關閉',stopped:'已關閉',startNone:'請先選擇風力、定時或紫外線',startSent:'已套用上次的設定',fan:'風力',time:'定時',uv:'紫外線殺菌',uvS:'紫外線',logTitle:'trace log',rights:'以 MIT 授權釋出。',hintInstall:'把控制器安裝成應用程式，之後可直接從桌面開啟',hintInstallBtn:'安裝',hintIos:'iPhone 的 Safari 不支援藍牙，請改用 Bluefy 瀏覽器開啟',hintIosBtn:'下載 Bluefy',disclaimer:'本專案為非官方開發，與 ANTSRIDER 品牌無關聯。',
  offv:'關閉',onv:'開啟',fanN:n=>n+' 檔',minN:n=>n+' 分鐘',hourN:n=>n+' 小時',connected:'已連線',notConn:'尚未連線設備',sent:'送出 ',sendFail:'送出失敗：',sendFailMsg:'指令送出失敗，請確認設備仍在連線',
  noBt:'此瀏覽器不支援藍牙連線，請使用 Android 或電腦版的 Chrome／Edge，並以 https 開啟。',dropped:'設備已斷線',droppedAuto:'設備已斷線，等待自動重新連線…',connecting:'連線中…',noNotify:'未啟用通知：',reply:'設備回傳',
  aWaiting:'自動連線：已在等待中',aNoApi:'自動連線：此瀏覽器不支援 getDevices',aNoApiMsg:'此瀏覽器不支援自動連線',aStart:'自動連線：開始尋找已授權設備',aFound:n=>'自動連線：已授權設備 '+n+' 個',aNone:'自動連線：沒有已授權設備，請先手動連線一次',aNoneMsg:'自動連線需先手動連線一次',waiting:'等待設備…',aFail:'自動連線失敗：',aAdv:'自動連線：等待設備廣播',aNoAdv:'自動連線：不支援 watchAdvertisements，直接連線',aCant:'自動連線無法啟動：',connFail:'連線失敗：',connFailMsg:'連線失敗，請確認手機小程序已斷線、設備已開機並靠近',noLog:'尚無記錄'},
 en: {title:'Helmet Dryer & Sterilizer',conn:'Connection',off:'Not connected',connect:'Connect',disconnect:'Disconnect',auto:'Auto-connect',autoLock:'Connect manually once to enable this',clear:'Clear',start:'Start',stop:'Stop',stopped:'Turned off',startNone:'Pick a fan level, timer or UV first',startSent:'Applied your last settings',autoDesc:'Connect automatically when the device is nearby, on page load or after a drop',fan:'Fan',time:'Timer',uv:'UV light',uvS:'UV',logTitle:'trace log',rights:'Released under the MIT License.',hintInstall:'Install this controller as an app to open it from your home screen',hintInstallBtn:'Install',hintIos:'Safari on iPhone has no Bluetooth support. Open this page in the Bluefy browser',hintIosBtn:'Get Bluefy',disclaimer:'Unofficial project, not affiliated with ANTSRIDER.',
  offv:'Off',onv:'On',fanN:n=>'Level '+n,minN:n=>n+' min',hourN:n=>n+(n===1?' hr':' hrs'),connected:'Connected',notConn:'Device not connected',sent:'Sent ',sendFail:'Send failed: ',sendFailMsg:'Command failed. Make sure the device is still connected.',
  noBt:'This browser does not support Bluetooth. Use Chrome or Edge on Android or desktop, over https.',dropped:'Device disconnected',droppedAuto:'Device disconnected. Waiting to reconnect automatically…',connecting:'Connecting…',noNotify:'Notifications not enabled: ',reply:'Device reply',
  aWaiting:'Auto-connect: already waiting',aNoApi:'Auto-connect: getDevices is not supported in this browser',aNoApiMsg:'Auto-connect is not supported in this browser',aStart:'Auto-connect: looking for permitted devices',aFound:n=>'Auto-connect: '+n+' permitted device(s)',aNone:'Auto-connect: no permitted device, connect manually once first',aNoneMsg:'Connect manually once to enable auto-connect',waiting:'Waiting for device…',aFail:'Auto-connect failed: ',aAdv:'Auto-connect: waiting for device advertisement',aNoAdv:'Auto-connect: watchAdvertisements unsupported, connecting directly',aCant:'Auto-connect could not start: ',connFail:'Connection failed: ',connFailMsg:'Connection failed. Make sure the mini-program is disconnected and the device is on and nearby.',noLog:'No entries yet'}
};
const FAVICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#111"/><path d="M10 38C10 24 20 14 33 14c12 0 21 8 21 20v10c0 2-1 4-4 4H20c-6 0-10-4-10-10z" fill="@@"/><path d="M30 26h24v13c0 1-1 2-2 2H36c-4 0-6-2-6-6z" fill="#111"/><path d="M33 28h19v5H33z" fill="#fff" opacity=".25"/><rect x="8" y="46" width="48" height="4" rx="2" fill="@@" opacity=".5"/></svg>';
const THEMES = {lime:'#b6ff00',pink:'#ff7aa8',teal:'#22c1d6',orange:'#ff9a1f'};
let lang = localStorage.getItem('lang') || (/^zh/i.test(navigator.language) ? 'zh' : 'en');
let theme = localStorage.getItem('theme'); if (!THEMES[theme]) theme = 'lime';
const t = (k, ...a) => { const v = I18N[lang][k]; return typeof v === 'function' ? v(...a) : v; };
let logEmpty = true;
function applyLang() {
  document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : 'en';
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  document.title = 'NA ANTSRIDER ' + t('title');
  $('langText').textContent = lang === 'zh' ? 'EN' : '繁中';
  $('uv').setAttribute('aria-label', t('uv'));
  if (logEmpty) $('log').textContent = t('noLog');
  renderAuto();
}
function applyTheme() {
  document.documentElement.style.setProperty('--accent', THEMES[theme]);
  document.querySelector('link[rel=icon]').href = 'data:image/svg+xml,' + encodeURIComponent(FAVICON.replace(/@@/g, THEMES[theme]));
  document.querySelector('meta[name=theme-color]').content = '#111111';
  document.querySelectorAll('.sw').forEach(b => b.classList.toggle('sel', b.dataset.t === theme));
}
let device, writeChar = null, fan = 1, minutes = 0, uvOn = false, running = false;
try {
  const saved = JSON.parse(localStorage.getItem('state') || '{}');
  if (FAN_OPTIONS.includes(saved.fan)) fan = saved.fan;
  if (TIME_OPTIONS.includes(saved.minutes)) minutes = saved.minutes;
  uvOn = saved.uvOn === true;
  running = saved.running === true;
} catch (e) {}

$('year').textContent = new Date().getFullYear();
const hex = b => [...new Uint8Array(b.buffer || b)].map(x => x.toString(16).padStart(2,'0')).join(' ');
const log = s => {
  const l = $('log');
  if (logEmpty) { l.textContent = ''; logEmpty = false; }
  l.textContent += (l.textContent ? '\n' : '') + new Date().toLocaleTimeString() + '  ' + s;
  l.scrollTop = l.scrollHeight;
};
let msgTimer;
const msg = s => {
  const el = $('msg'); clearTimeout(msgTimer);
  if (!s) { el.classList.remove('show'); return; }
  el.textContent = s; el.classList.add('show');
  msgTimer = setTimeout(() => el.classList.remove('show'), 4500);
};
const fanLabel = n => n === 0 ? t('offv') : t('fanN', n);
const timeLabel = n => n === 0 ? t('offv') : n >= 60 && n % 60 === 0 ? t('hourN', n / 60) : t('minN', n);

function buildGrid(el, options, label, onPick) {
  el.innerHTML = '';
  options.forEach(v => {
    const b = document.createElement('button');
    b.className = 'chip'; b.dataset.v = v; b.disabled = true;
    b.textContent = label(v);
    b.onclick = () => onPick(v);
    el.appendChild(b);
  });
}
function render(connected) {
  localStorage.setItem('state', JSON.stringify({ fan, minutes, uvOn, running }));
  document.querySelectorAll('#fanGrid .chip').forEach(b => { b.classList.toggle('sel', +b.dataset.v === fan); if (connected !== undefined) b.disabled = !connected; });
  document.querySelectorAll('#timeGrid .chip').forEach(b => { b.classList.toggle('sel', +b.dataset.v === minutes); if (connected !== undefined) b.disabled = !connected; });
  $('fanNow').textContent = fanLabel(fan);
  $('timeNow').textContent = timeLabel(minutes);
  $('start').classList.toggle('running', running); $('start').setAttribute('aria-pressed', running);
  $('startText').textContent = running ? t('stop') : t('start');
  $('startIcon').textContent = running ? 'stop_circle' : 'power_settings_new';
  $('tFan').textContent = fanLabel(fan);
  $('tTime').textContent = timeLabel(minutes);
  $('uvNow').textContent = uvOn ? t('onv') : t('offv');
  $('uv').classList.toggle('on', uvOn);
  $('uv').setAttribute('aria-checked', uvOn);
  if (connected !== undefined) { $('uv').disabled = !connected; $('start').disabled = !connected; }
}
function setConnected(on, text) {
  $('state').classList.toggle('on', on);
  $('stateText').textContent = text || (on ? t('connected') : t('off'));
  $('stateText').title = $('stateText').textContent;
  $('state').title = $('stateText').textContent;
  $('connect').hidden = on; $('disconnect').hidden = !on;
  render(on);
}

async function send(bytes, desc) {
  if (!writeChar) { msg(t('notConn')); return false; }
  const data = new Uint8Array(bytes);
  try {
    await writeChar.writeValueWithoutResponse(data);
    log(t('sent') + desc + '  [' + hex(data) + ']');
    msg(''); return true;
  } catch (e) { log(t('sendFail') + e.message); msg(t('sendFailMsg')); return false; }
}
async function pickFan(n) { const old = fan; fan = n; render(); if (!await send([0xAA,0x01,n], t('fan') + ' ' + fanLabel(n))) { fan = old; render(); } }
async function pickTime(n) { const old = minutes; minutes = n; render(); if (!await send([0xAA,0x02,(n>>8)&255,n&255], t('time') + ' ' + timeLabel(n))) { minutes = old; render(); } }
async function toggleUV() { const old = uvOn; uvOn = !uvOn; render(); if (!await send([0xAA,0x03,0x00,0x00,uvOn?1:0], t('uv') + ' ' + (uvOn ? t('onv') : t('offv')))) { uvOn = old; render(); } }

$('logOpen').onclick = () => { $('logModal').showModal(); $('log').scrollTop = $('log').scrollHeight; };
$('logClose').onclick = () => $('logModal').close();
$('logClear').onclick = () => { logEmpty = true; $('log').textContent = t('noLog'); };
$('logModal').addEventListener('click', e => { if (e.target === $('logModal')) $('logModal').close(); });
const sleep = (ms, v) => new Promise(r => setTimeout(() => r(v), ms));
$('start').onclick = async () => {
  if (!running) {
    if (fan === 0) fan = 1;
    running = true; render();
    let ok = true;
    if (minutes > 0) ok = await send([0xAA,0x02,(minutes>>8)&255,minutes&255], t('time') + ' ' + timeLabel(minutes)) && await sleep(200, true);
    if (ok) ok = await send([0xAA,0x03,0x00,0x00,uvOn ? 1 : 0], t('uv') + ' ' + (uvOn ? t('onv') : t('offv'))) && await sleep(200, true);
    if (ok) ok = await send([0xAA,0x01,fan], t('fan') + ' ' + fanLabel(fan));
    if (!ok) { running = false; render(); return; }
    msg(t('startSent'));
  } else {
    running = false; render();
    const ok = await send([0xAA,0x01,0], t('fan') + ' ' + t('offv'))
      && await sleep(150, true) && await send([0xAA,0x02,0,0], t('time') + ' ' + t('offv'))
      && await sleep(150, true) && await send([0xAA,0x03,0x00,0x00,0], t('uv') + ' ' + t('offv'));
    if (!ok) { running = true; render(); return; }
    msg(t('stopped'));
  }
};
buildGrid($('fanGrid'), FAN_OPTIONS, fanLabel, pickFan);
buildGrid($('timeGrid'), TIME_OPTIONS, timeLabel, pickTime);
$('uv').onclick = toggleUV;

if (!navigator.bluetooth) {
  $('connect').disabled = true;
  msg(t('noBt'));
}
let paired = localStorage.getItem('paired') === '1';
let autoOn = paired && localStorage.getItem('autoConnect') === '1';
let manualStop = false, watching = false;
function renderAuto() {
  $('auto').classList.toggle('on', autoOn); $('auto').setAttribute('aria-checked', autoOn);
  $('auto').disabled = !paired;
  $('autoHint').textContent = '';
}
async function connectTo(dev) {
  device = dev;
  if (!dev._bound) {
    dev._bound = true;
    dev.addEventListener('gattserverdisconnected', () => {
      writeChar = null; setConnected(false); log(t('dropped'));
      if (autoOn && !manualStop) { msg(t('droppedAuto')); watchAuto(); } else msg(t('dropped'));
    });
  }
  setConnected(false, t('connecting'));
  const server = await dev.gatt.connect();
  const svc = await server.getPrimaryService(SERVICE);
  writeChar = await svc.getCharacteristic(WRITE_CHAR);
  try {
    const n = await svc.getCharacteristic(NOTIFY_CHAR);
    await n.startNotifications();
    n.addEventListener('characteristicvaluechanged', e => log(t('reply') + '  [' + hex(e.target.value) + ']'));
  } catch (e) { log(t('noNotify') + e.message); }
  if (!paired) { paired = true; localStorage.setItem('paired', '1'); renderAuto(); }
  setConnected(true, t('connected') + ' ' + (dev.name || ''));
  msg(''); log(t('connected') + ' ' + dev.name);
  runPending();
}
async function watchAuto() {
  if (!autoOn) return;
  if (watching) { log(t('aWaiting')); return; }
  if (!navigator.bluetooth || !navigator.bluetooth.getDevices) { log(t('aNoApi')); msg(t('aNoApiMsg')); return; }
  log(t('aStart'));
  watching = true;
  try {
    const all = await navigator.bluetooth.getDevices();
    log(t('aFound', all.length));
    const devs = all.filter(d => (d.name || '').startsWith('KT6328A-BLE'));
    if (!devs.length) { log(t('aNone')); msg(t('aNoneMsg')); watching = false; return; }
    const dev = devs[0];
    setConnected(false, t('waiting'));
    const finish = async () => {
      if (!watching) return;
      watching = false;
      try { await connectTo(dev); } catch (e) { log(t('aFail') + e.message); setConnected(false); watchAuto(); }
    };
    if (dev.watchAdvertisements) {
      dev.addEventListener('advertisementreceived', finish, { once: true });
      await dev.watchAdvertisements();
      log(t('aAdv'));
    } else { log(t('aNoAdv')); await finish(); }
  } catch (e) { watching = false; log(t('aCant') + e.message); setConnected(false); }
}
$('auto').onclick = () => {
  autoOn = !autoOn; localStorage.setItem('autoConnect', autoOn ? '1' : '0'); renderAuto();
  if (autoOn) { manualStop = false; if (!writeChar) watchAuto(); } else watching = false;
};
$('connect').onclick = async () => {
  try {
    manualStop = false; watching = false;
    const dev = await navigator.bluetooth.requestDevice({ filters: [{ namePrefix: 'KT6328A-BLE' }], optionalServices: [SERVICE] });
    await connectTo(dev);
  } catch (e) {
    setConnected(false);
    if (e.name !== 'NotFoundError') { log(t('connFail') + e.message); msg(t('connFailMsg')); }
  }
};
$('disconnect').onclick = () => { manualStop = true; if (device && device.gatt.connected) device.gatt.disconnect(); };
Object.keys(THEMES).forEach(k => { const b = document.createElement('button'); b.className = 'sw'; b.dataset.t = k; b.style.background = THEMES[k]; b.setAttribute('aria-label', k); b.onclick = () => { theme = k; localStorage.setItem('theme', k); applyTheme(); }; $('swatches').appendChild(b); });
$('lang').onclick = () => { lang = lang === 'zh' ? 'en' : 'zh'; localStorage.setItem('lang', lang); applyLang(); buildGrid($('fanGrid'), FAN_OPTIONS, fanLabel, pickFan); buildGrid($('timeGrid'), TIME_OPTIONS, timeLabel, pickTime); setConnected(!!writeChar); };
document.querySelectorAll('details[data-fold]').forEach(d => {
  const v = localStorage.getItem('fold-' + d.dataset.fold);
  if (v !== null) d.open = v === '1';
  d.addEventListener('toggle', () => localStorage.setItem('fold-' + d.dataset.fold, d.open ? '1' : '0'));
});
applyTheme();
applyLang();
// manifest shortcuts: ?action=start|stop runs once connected
let pendingAction = new URLSearchParams(location.search).get('action');
if (pendingAction !== 'start' && pendingAction !== 'stop') pendingAction = null;
function runPending() {
  if (!pendingAction) return;
  const a = pendingAction; pendingAction = null;
  history.replaceState(null, '', location.pathname);
  if (a === 'start' && !running) $('start').click();
  else if (a === 'stop') { running = true; $('start').click(); }
}
if (pendingAction && paired && !autoOn) autoOn = true;
setConnected(false);
renderAuto();
watchAuto();

if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});

// install / Bluefy hint
(() => {
  const box = $('hint'), btn = $('hintBtn'), text = $('hintText');
  const q = new URLSearchParams(location.search).get('hint');
  const ios = q === 'ios' || /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const bluefy = /Bluefy/i.test(navigator.userAgent) || !!navigator.bluetooth;
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (localStorage.getItem('hintOff') || standalone) return;
  let deferred = null;
  const show = (kind) => {
    const set = () => { text.textContent = t(kind === 'ios' ? 'hintIos' : 'hintInstall'); btn.textContent = t(kind === 'ios' ? 'hintIosBtn' : 'hintInstallBtn'); };
    set(); box.hidden = false; document.querySelectorAll('#lang').forEach(b => b.addEventListener('click', set));
    btn.onclick = async () => {
      if (kind === 'ios') { location.href = 'https://apps.apple.com/app/bluefy-web-ble-browser/id1492822055'; return; }
      if (!deferred) return; deferred.prompt(); await deferred.userChoice; deferred = null; box.hidden = true;
    };
  };
  $('hintX').onclick = () => { box.hidden = true; localStorage.setItem('hintOff', '1'); };
  if (ios && (q === 'ios' || !bluefy)) show('ios');
  else if (q === 'install') show('install');
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; if (!ios) show('install'); });
  window.addEventListener('appinstalled', () => { box.hidden = true; });
})();
