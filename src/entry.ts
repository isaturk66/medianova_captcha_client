import InlineWorker from './worker?worker&inline';
import Altcha from './Altcha.svelte';
import globalCss from './altcha.css?raw';
import './i18n/en';          // 1-liner – default fallback only


function injectGlobalCss(css: string, id: string = '__altcha-css') {
  if (!document.getElementById(id)) {
    const style = document.createElement('style');
    style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
  }
}


globalThis.altchaCreateWorker = (url?: string) =>
  url ? new Worker(new URL(url)) : new InlineWorker();

injectGlobalCss(globalCss);

export { Altcha };