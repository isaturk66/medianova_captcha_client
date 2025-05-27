<svelte:options
  customElement={{
    tag: 'altcha-widget',
    shadow: 'none',
    props: {
      debug: {
        type: 'Boolean',
      },
      delay: {
        type: 'Number',
      },
      disableautofocus: {
        type: 'Boolean',
      },
      expire: {
        type: 'Number',
      },
      maxnumber: {
        type: 'Number',
      },
      mockerror: {
        type: 'Boolean',
      },
      refetchonexpire: {
        type: 'Boolean',
      },
      test: {
        type: 'Boolean',
      },
      workers: {
        type: 'Number',
      },
    },
  }}
/>

<script lang="ts">
  import { onDestroy, onMount, tick } from 'svelte';
  import {
    solveChallenge,
    createTestChallenge,
  } from './helpers';
  import type { Plugin } from './plugin';
  import { State } from './types';
  import {
    type Configure,
    type Payload,
    type Challenge,
    type Solution,
    type CustomFetchFunction,
    AudioState,
  } from './types';
  import './globals';
  import './i18n/en';

  interface Props {
    auto?: 'off' | 'onfocus' | 'onload' | 'onsubmit' | undefined;
    /** @deprecated */
    challengeurl?: string | undefined;
    challengejson?: string | undefined;
    credentials?: 'omit' | 'same-origin' | 'include' | boolean | undefined;
    customfetch?: string | CustomFetchFunction | undefined;
    debug?: boolean;
    delay?: number;
    disableautofocus?: boolean;
    expire?: number | undefined;
    id?: string;
    language?: string | undefined;
    name?: string;
    maxnumber?: number;
    mockerror?: boolean;
    refetchonexpire?: boolean;

    strings?: string | undefined;
    test?: boolean | number;
    verifyurl?: string | undefined;
    workers?: number;
    workerurl?: string | undefined;
  }

  let {
    auto = undefined,
    challengeurl = undefined,
    challengejson = undefined,
    credentials = undefined,
    customfetch = undefined,
    debug = false,
    delay = 0,
    disableautofocus = false,
    expire = undefined,
    id = undefined,
    language = undefined,
    name = 'altcha',
    maxnumber = 1e6,
    mockerror = false,
    refetchonexpire = true,
    strings = undefined,
    test = false,
    verifyurl = undefined,
    workers = Math.min(16, navigator.hardwareConcurrency || 8),
    workerurl = undefined,
  }: Props = $props();

  const { altchaI18n } = globalThis;
  const altchaI18nStore = altchaI18n.store;
  const allowedAlgs = ['SHA-256', 'SHA-384', 'SHA-512'];
  const website = 'https://www.medianova.com/';
  const dispatch = <T,>(event: string, detail?: T) => {
    $host().dispatchEvent(
      new CustomEvent(event, {
        detail,
      })
    );
  };
  const documentLocale = document.documentElement.lang?.split('-')?.[0];

  const parsedChallengeJson = $derived(
    challengejson ? parseJsonAttribute(challengejson) : undefined
  );
  const parsedStrings = $derived(strings ? parseJsonAttribute(strings) : {});
  const _strings = $derived({
    ...getI18nStrings($altchaI18nStore),
    ...parsedStrings,
  });
  const widgetId = $derived(
    `${id || name}_checkbox_${Math.round(Math.random() * 1e8)}`
  );

  let checked: boolean = $state(false);
  let codeChallenge: {
    challenge: Challenge;
    solution: Solution;
  } | null = $state(null);
  let currentState: State = $state(State.UNVERIFIED);
  let el: HTMLElement = $state()!;
  let elAudio: HTMLAudioElement | null = $state(null);
  let elCheckbox: HTMLInputElement | null = $state(null);
  let elForm: HTMLFormElement | null = $state(null);
  let error: string | null = $state(null);
  let expireTimeout: ReturnType<typeof setTimeout> | null = null;
  let codeChallengeAudioState: AudioState | null = $state(null);
  let codeChallengeSubmitting: boolean = $state(false);
  let loadedPlugins: Plugin[] = [];
  let playCodeChallengeAudio: boolean = $state(false);
  let payload: string | null = $state(null);

  $effect(() => {
    onErrorChangeHandler(error);
  });

  $effect(() => {
    onStateChangeHandler(currentState);
  });

  onDestroy(() => {
    destroyPlugins();
    if (elForm) {
      elForm.removeEventListener('submit', onFormSubmit);
      elForm.removeEventListener('reset', onFormReset);
      elForm.removeEventListener('focusin', onFormFocusIn);
      elForm = null;
    }
    if (expireTimeout) {
      clearTimeout(expireTimeout);
      expireTimeout = null;
    }

  });

  onMount(() => {
    log('mounted', ALTCHA_VERSION);
    log('workers', workers);
    if (test) {
      log('using test mode');
    }
    if (expire) {
      setExpire(expire);
    }
    if (auto !== undefined) {
      log('auto', auto);
    }
   
    elForm = el?.closest('form');
    if (elForm) {
      elForm.addEventListener('submit', onFormSubmit, {
        capture: true,
      });
      elForm.addEventListener('reset', onFormReset);
      if (auto === 'onfocus') {
        elForm.addEventListener('focusin', onFormFocusIn);
      }
    }
    if (auto === 'onload') {
      
        verify();
      
    }

    requestAnimationFrame(() => {
      dispatch('load');
    });
  });

  /**
   * Creates a Base64-encoded payload with solution.
   */
  function createAltchaPayload(data: Challenge, solution: Solution): string {
    return btoa(
      JSON.stringify({
        algorithm: data.algorithm,
        challenge: data!.challenge,
        number: solution.number,
        salt: data.salt,
        signature: data.signature,
        test: test ? true : undefined,
        took: solution.took,
      } satisfies Payload)
    );
  }

  /**
   * Destroys all loaded plugins.
   */
  function destroyPlugins() {
    for (const plugin of loadedPlugins) {
      plugin.destroy();
    }
  }

  /**
   * Sets the state to EXPIRED or re-fetches the challenge if `refetchonexpire` is enabled.
   */
  function expireChallenge() {
    if (challengeurl && refetchonexpire && currentState === State.VERIFIED) {
      // re-fetch challenge and verify again
      verify();
    } else {
      reset(State.EXPIRED, _strings.expired);
    }
  }

  /**
   * Fetches the challenge from the configured `challengeurl` or `challengejson`.
   */
  async function fetchChallenge(): Promise<Challenge> {
    if (mockerror) {
      log('mocking error');
      throw new Error('Mocked error.');
    } else if (parsedChallengeJson) {
      log('using provided json data');
      return parsedChallengeJson;
    } else if (test) {
      log('generating test challenge', { test });
      return createTestChallenge(typeof test !== 'boolean' ? +test : undefined);
    } else {
      if (!challengeurl && elForm) {
        const action = elForm.getAttribute('action');
        if (action?.includes('/form/')) {
          // ALTCHA Forms url for challenges
          challengeurl = action + '/altcha';
        }
      }
      if (!challengeurl) {
        throw new Error(`Attribute challengeurl not set.`);
      }
      log('fetching challenge from', challengeurl);
      const init: RequestInit = {
        credentials: typeof credentials === 'boolean' ? 'include' : credentials,
        headers: {},
      };
      const resp = await getFetchFunction()(challengeurl, init);
      if (!resp || resp instanceof Response === false) {
        throw new Error(`Custom fetch function did not return a response.`);
      }
      if (resp.status !== 200) {
        throw new Error(`Server responded with ${resp.status}.`);
      }
      const configHeader = resp.headers.get('X-Altcha-Config');
      const json = await resp.json();
      const params = new URLSearchParams(json.salt.split('?')?.[1]);
      const expires = params.get('expires') || params.get('expire');
      if (expires) {
        const date = new Date(+expires * 1000);
        const diff = !isNaN(date.getTime()) ? date.getTime() - Date.now() : 0;
        if (diff > 0) {
          setExpire(diff);
        }
      }
      if (configHeader) {
        try {
          const config = JSON.parse(configHeader);
          if (config && typeof config === 'object') {
            if (config.verifyurl && !config.verifyurl.startsWith('fn:')) {
              config.verifyurl = getServerUrl(config.verifyurl);
            }
            configure(config);
          }
        } catch (err) {
          log('unable to configure from X-Altcha-Config', err);
        }
      }
      return json;
    }
  }

  /**
   * Get the custom `fetch` function if configured or return the default one.
   */
  function getFetchFunction() {
    let fetchFunction: CustomFetchFunction = fetch;
    if (customfetch) {
      log('using customfetch');
      if (typeof customfetch === 'string') {
        fetchFunction =
          globalThis[customfetch as keyof typeof globalThis] || null;
        if (!fetchFunction) {
          throw new Error(`Custom fetch function not found: ${customfetch}`);
        }
      } else {
        fetchFunction = customfetch;
      }
    }
    return fetchFunction;
  }

  /**
   * Get internalization strings based on the language preferences provided
   */
  function getI18nStrings(
    i18n: Record<string, any>,
    languages: string[] = [
      language || '',
      document.documentElement.lang || '',
      ...navigator.languages,
    ]
  ) {
    const codes = Object.keys(i18n).map((code) => code.toLowerCase());
    const lang = languages.reduce(
      (acc, lang) => {
        lang = lang.toLowerCase();
        return (
          acc ||
          (i18n[lang] ? lang : null) ||
          codes.find((code) => lang.split('-')[0] === code.split('-')[0]) ||
          null
        );
      },
      null as string | null
    );
    return i18n[lang || 'en'];
  }

  /**
   * Get the full URL based on the origin uri of the challengeurl.
   */
  function getServerUrl(
    uri: string,
    params?: Record<string, string | undefined | null>
  ) {
    const baseUrl = new URL(challengeurl || location.origin);
    const result = new URL(uri, baseUrl);
    if (!result.search) {
      result.search = baseUrl.search;
    }
    if (params) {
      for (const key in params) {
        if (params[key] !== undefined && params[key] !== null) {
          result.searchParams.set(key, params[key]);
        }
      }
    }
    return result.toString();
  }
  /**
   * Logs debug information to the console.
   */
  function log(...args: unknown[]) {
    if (debug || args.some((a) => a instanceof Error)) {
      console[args[0] instanceof Error ? 'error' : 'log'](
        'ALTCHA',
        `[name=${name}]`,
        ...args
      );
    }
  }

  /**
   * Handles the `ended` event on the audio element
   */
  function onAudioEnded() {
    codeChallengeAudioState = AudioState.PAUSED;
  }

  /**
   * Handles the `error` event on the audio element
   */
  function onAudioError(ev: Event) {
    codeChallengeAudioState = AudioState.ERROR;
  }

  /**
   * Handles the `canplay` event on the audio element
   */
  function onAudioCanPlay() {
    codeChallengeAudioState = AudioState.READY;
  }

  /**
   * Handles the `loadstart` event on the audio element
   */
  function onAudioLoadStart() {
    codeChallengeAudioState = AudioState.LOADING;
  }

  /**
   * Handles the `playing` event on the audio element
   */
  function onAudioPlaying() {
    codeChallengeAudioState = AudioState.PLAYING;
  }

  /**
   * Handles the `pause` event on the audio element
   */
  function onAudioPause() {
    codeChallengeAudioState = AudioState.PAUSED;
  }

  /**
   * Handles the `keydown` event in the code-challenge input (Space to play audio)
   */
  function onCodeChallengeInputKeyDown(ev: KeyboardEvent) {
    if (ev.code === 'Space') {
      ev.preventDefault();
      ev.stopImmediatePropagation();
      onPlayCodeChallengeAudio();
    }
  }

  /**
   * Handles "reload" button for the code challenge and forces re-verification
   */
  function onCodeChallengeReload(ev: Event) {
    ev.preventDefault();
    verify();
  }

  /**
   * Handles the submit event of the code-challenge form
   */
  function onCodeChallengeSubmit(ev: SubmitEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    if (codeChallenge) {
      const data = new FormData(ev.target as HTMLFormElement);
      const code = String(data.get('code'));
      if (verifyurl?.startsWith('fn:')) {
        const functionName = verifyurl.replace(/^fn:/, '');
        log(`calling ${functionName} function instead of verifyurl`);
        if (!(functionName in globalThis)) {
          throw new Error(`Global function "${functionName}" is undefined.`);
        }
        return globalThis[functionName as keyof typeof globalThis]({
          challenge: codeChallenge.challenge,
          code,
          solution: codeChallenge.solution,
        });
      }
      codeChallengeSubmitting = true;

      //    reason, verified = createAltchaPayload(codeChallenge.challenge, codeChallenge.solution)

      //    if (!verified) {
      //         reset();
      //         error = reason || 'Verification failed';
      //       } else {
      //         codeChallenge = null;
      //         setState(State.VERIFIED);
      //         log('verified');
      //         tick().then(() => {
      //           // Focus the checkbox for better accessibility
      //           elCheckbox?.focus();
      //           dispatch('verified', { payload });
      //         });
      //       }

      //       codeChallengeSubmitting = false;

      //   }
      // }

      //This is where the actual verification logic will be implemented. for now

      codeChallenge = null;
      setState(State.VERIFIED);
      log('verified');
      tick().then(() => {
        // Focus the checkbox for better accessibility
        elCheckbox?.focus();
        dispatch('verified', { payload });
      });
      codeChallengeSubmitting = false;
    }
  }

  /**
   * Called when the checkbox is checked or unchecked.
   */
  function onCheckedChange() {
    if (
      [State.UNVERIFIED, State.ERROR, State.EXPIRED, State.CODE].includes(
        currentState
      )
    ) {
      if (elForm?.reportValidity() === false) {
        checked = false;
      }  else {
        verify();
      }
    } else {
      checked = true;
    }
  }




  /**
   * Handles changes in the error state and notifies plugins.
   */
  function onErrorChangeHandler(_: typeof error) {
    for (const plugin of loadedPlugins) {
      if (typeof plugin.onErrorChange === 'function') {
        plugin.onErrorChange(error);
      }
    }
  }

  /**
   * Handles the form focus-in event.
   */
  function onFormFocusIn(ev: FocusEvent) {
      if (currentState === State.UNVERIFIED) {
    verify();
  }
  }

  /**
   * Handles the form submission event.
   */
  function onFormSubmit(ev: SubmitEvent) {
    const target = ev.target as HTMLFormElement | null;
    const submitter = ev.submitter as HTMLElement | null;
    const isCodeChallengeForm = target?.hasAttribute(
      'data-code-challenge-form'
    );
    if (isCodeChallengeForm) {
      // Submit event from the code-challenge form -> don't handle
      return;
    }
    if (elForm && auto === 'onsubmit') {
      if (currentState === State.UNVERIFIED) {
        ev.preventDefault();
        ev.stopPropagation();
        verify().then(() => {
          requestSubmit(submitter);
        });
      } else if (currentState !== State.VERIFIED) {
        ev.preventDefault();
        ev.stopPropagation();
        if (currentState === State.VERIFYING) {
          onInvalid();
        }
      }
    }
  }

  /**
   * Handles the form reset event.
   */
  function onFormReset() {
    reset();
  }

  /**
   * Called when the form is submitted while in VERIFYING state and shows an alert message if the string `waitAlert` is configured.
   */
  function onInvalid() {
    if (currentState === State.VERIFYING && _strings.waitAlert) {
      alert(_strings.waitAlert);
    }
  }

  /**
   * Plays the audio challenge.
   */
  function onPlayCodeChallengeAudio() {
    if (elAudio) {
      if (!elAudio.paused) {
        elAudio.pause();
      } else {
        elAudio.currentTime = 0;
        elAudio.play();
      }
    } else {
      playCodeChallengeAudio = true;
      // required for safari
      requestAnimationFrame(() => {
        elAudio?.play();
      });
    }
  }

  /**
   * Handles changes in the state and updates the UI accordingly.
   */
  function onStateChangeHandler(_: typeof currentState) {
    for (const plugin of loadedPlugins) {
      if (typeof plugin.onStateChange === 'function') {
        plugin.onStateChange(currentState);
      }
    }
    
    checked = currentState === State.VERIFIED;
  }


  /**
   * Parses a JSON attribute string.
   */
  function parseJsonAttribute(str: string) {
    return JSON.parse(str);
  }

  /**
   * Request form submit with a fallback for iOS <16 which does not support requestSubmit
   */
  function requestSubmit(submitter?: HTMLElement | null) {
    if (elForm && 'requestSubmit' in elForm) {
      elForm.requestSubmit(submitter);
      // @ts-ignore
    } else if (elForm?.reportValidity()) {
      if (submitter) {
        submitter.click();
      } else {
        // @ts-ignore
        elForm.submit();
      }
    }
  }

  /**
   * Sets the expiration timeout for the challenge.
   */
  function setExpire(duration: number) {
    log('expire', duration);
    if (expireTimeout) {
      clearTimeout(expireTimeout);
      expireTimeout = null;
    }
    if (duration < 1) {
      expireChallenge();
    } else {
      expireTimeout = setTimeout(expireChallenge, duration);
    }
  }


  /**
   * Validates a retrieved challenge and throws if invalid.
   */
  function validateChallenge(data: Challenge) {
    if (!data.algorithm) {
      throw new Error(`Invalid challenge. Property algorithm is missing.`);
    }
    if (data.signature === undefined) {
      throw new Error('Invalid challenge. Property signature is missing.');
    }
    if (!allowedAlgs.includes(data.algorithm.toUpperCase())) {
      throw new Error(
        `Unknown algorithm value. Allowed values: ${allowedAlgs.join(', ')}`
      );
    }
    if (!data.challenge || data.challenge.length < 40) {
      throw new Error('Challenge is too short. Min. 40 chars.');
    }
    if (!data.salt || data.salt.length < 10) {
      throw new Error('Salt is too short. Min. 10 chars.');
    }
  }

  async function solve(data: Challenge): Promise<{
    data: Challenge ;
    solution: Solution | null;
  }> {
    let solution: Solution  | null = null;
    if ('Worker' in window) {
      try {
        solution = await solveWorkers(
          data,
          data.maxNumber || data.maxnumber || maxnumber
        );
      } catch (err) {
        log(err);
      }
      if (solution?.number !== undefined ) {
        return {
          data,
          solution,
        };
      }
    }
    return {
      data,
      solution: await solveChallenge(
        data.challenge,
        data.salt,
        data.algorithm,
        data.maxNumber || data.maxnumber || maxnumber
      ).promise,
    };
  }

  async function solveWorkers(
    challenge: Challenge,
    max: number = typeof test === 'number'
      ? test
      : challenge.maxNumber || challenge.maxnumber || maxnumber,
    concurrency: number = Math.ceil(workers)
  ): Promise<Solution | null> {
    const workersInstances: Worker[] = [];
    concurrency = Math.min(16, max, Math.max(1, concurrency));
    for (let i = 0; i < concurrency; i++) {
      workersInstances.push(altchaCreateWorker(workerurl));
    }
    const step = Math.ceil(max / concurrency);
    const solutions = await Promise.all(
      workersInstances.map((worker, i) => {
        const start = i * step;
        return new Promise((resolve) => {
          worker.addEventListener('message', (message: MessageEvent) => {
            if (message.data) {
              for (const w of workersInstances) {
                if (w !== worker) {
                  w.postMessage({ type: 'abort' });
                }
              }
            }
            resolve(message.data);
          });
          worker.postMessage({
            payload: challenge,
            max: start + step,
            start,
            type: 'work',
          });
        }) as Promise<Solution | null>;
      })
    );
    for (const worker of workersInstances) {
      worker.terminate();
    }
    return solutions.find((solution) => !!solution) || null;
  }

  /**
   * Programmatically configure the widget with given options.
   */
  export function configure(options: Configure) {

    if (options.auto !== undefined) {
      auto = options.auto;
      if (auto === 'onload') {
        
          verify();
        
      }
    }
    if (options.customfetch !== undefined) {
      customfetch = options.customfetch;
    }
    if (options.delay !== undefined) {
      delay = options.delay;
    }
    if (options.expire !== undefined) {
      setExpire(options.expire);
      expire = options.expire;
    }
    if (options.challenge) {
      challengejson =
        typeof options.challenge === 'string'
          ? options.challenge
          : JSON.stringify(options.challenge);
      validateChallenge(parsedChallengeJson);
    }
    if (options.challengeurl !== undefined) {
      challengeurl = options.challengeurl;
    }
    if (options.debug !== undefined) {
      debug = !!options.debug;
    }

    if (options.language !== undefined) {
      strings = getI18nStrings($altchaI18nStore, [options.language]);
    }
    if (options.maxnumber !== undefined) {
      maxnumber = +options.maxnumber;
    }
    if (options.mockerror !== undefined) {
      mockerror = !!options.mockerror;
    }
    if (options.name !== undefined) {
      name = options.name;
    }
    if (options.refetchonexpire !== undefined) {
      refetchonexpire = !!options.refetchonexpire;
    }

    if (options.strings) {
      strings =
        typeof options.strings === 'string'
          ? options.strings
          : JSON.stringify(options.strings);
    }
    if (options.test !== undefined) {
      test = typeof options.test === 'number' ? options.test : !!options.test;
    }
    if (options.verifyurl !== undefined) {
      verifyurl = options.verifyurl;
    }
    if (options.workers !== undefined) {
      workers = +options.workers;
    }
    if (options.workerurl !== undefined) {
      workerurl = options.workerurl;
    }
  }

  /**
   * Get the current configuration options. This is wrong.
   */
  export function getConfiguration(): Configure {
    return {
       auto,
      challengeurl,
      debug,
      delay,
      expire,
      name,
      maxnumber,
      mockerror,
      refetchonexpire,
      strings: _strings,
      test,
      verifyurl,
      workers,
      workerurl,
    };
  }


  /**
   * Get a loaded plugin by it's name.
   */
  export function getPlugin(name: string) {
    return loadedPlugins.find(
      (plugin) => (plugin.constructor as any).pluginName === name
    );
  }

  /**
   * Get the current state.
   */
  export function getState() {
    return currentState;
  }

  /**
   * Hide the widget using `display = 'none'`
   */
  export function hide() {
    el.style.display = 'none';
  }

  /**
   * Clears the state and resets the form.
   */
  export function reset(
    newState: State = State.UNVERIFIED,
    err: string | null = null
  ) {
    if (expireTimeout) {
      clearTimeout(expireTimeout);
      expireTimeout = null;
    }
    checked = false;
    payload = null;
    codeChallenge = null;
    playCodeChallengeAudio = false;
    codeChallengeAudioState = null;
    setState(newState, err);
  }


  /**
   * Set the state and optional error message.
   */
  export function setState(newState: State, err: string | null = null) {
    currentState = newState;
    error = err;
    dispatch('statechange', { payload, state: currentState });
  }

  /**
   * Show the widget using `display = 'block'` and reposition when floating.
   */
  export function show() {
    el.style.display = 'block';
  
  }

  /**
   * Triggers verification.
   */
  export async function verify() {
    reset(State.VERIFYING);
    await new Promise((resolve) => setTimeout(resolve, delay || 0));
    return fetchChallenge()
      .then((data) => {
        validateChallenge(data);
        log('challenge', data);
        return solve(data);
      })
      .then(({ data, solution }) => {
        log('solution', solution);
        if (
          !solution ||
          (data && 'challenge' in data && !('clearText' in solution))
        ) {
          if (solution?.number !== undefined && 'challenge' in data) {
            if (verifyurl && 'codeChallenge' in data) {
              if (
                document.activeElement?.tagName === 'INPUT' &&
                disableautofocus === false
              ) {
                // blur the checkbox to make the code challenge input autofocus work
                (document.activeElement as HTMLInputElement).blur();
              }
              codeChallenge = {
                challenge: data,
                solution,
              };
            } else {
              payload = createAltchaPayload(data, solution);
              log('payload', payload);
            }
          } else {
            log(
              "Unable to find a solution. Ensure that the 'maxnumber' attribute is greater than the randomly generated number."
            );
            throw new Error('Unexpected result returned.');
          }
        }
      })
      .then(() => {
        if (codeChallenge) {
          setState(State.CODE);
          tick().then(() => {
            dispatch('code', { codeChallenge });
          });
        } else {
          setState(State.VERIFIED);
          log('verified');
          tick().then(() => {
            dispatch('verified', { payload });
          });
        }
      })
      .catch((err) => {
        log(err);
        setState(State.ERROR, err.message);
      });
  }
</script>

<slot />

<div
  bind:this={el}
  class="altcha"
  data-state={currentState}
>
  <div class="altcha-main">
    <div
      class="altcha-checkbox"
      class:altcha-checkbox-verifying={currentState === State.VERIFYING}
    >
      {#if currentState === State.VERIFYING}
        {@render spinner()}
      {/if}
      <input
        bind:this={elCheckbox}
        type="checkbox"
        id={widgetId}
        required={auto !== 'onsubmit' }
        bind:checked
        onchange={onCheckedChange}
        oninvalid={onInvalid}
      />
    </div>

    <label class="altcha-label" for={widgetId}>
      {#if currentState === State.VERIFIED}
        {@html _strings.verified}
      {:else if currentState === State.VERIFYING}
        {@html _strings.verifying}
      {:else if currentState === State.CODE}
        {@html _strings.verificationRequired}
      {:else}
        {@html _strings.label}
      {/if}
    </label>

    {#if currentState === State.VERIFIED}
      <input type="hidden" {name} value={payload} />
    {/if}

      <div>
        <a
          href={website}
          target="_blank"
          class="altcha-logo"
          aria-label={_strings.ariaLinkLabel}
          aria-hidden="true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
             width="100"
            height="20"
            viewBox="0 0 1210 200"
            fill="none"
          >
            <style type="text/css">
              .st0 {
                fill-rule: evenodd;
                clip-rule: evenodd;
                fill: #ec2027;
              }
              .st1 {
                fill: #002133;
              }
              .st2 {
                fill: #ec2027;
              }
            </style>
            <g
              id="Vector_Smart_Object_00000030466827934817185210000010797782918708865684_"
            >
              <g>
                <g>
                  <path
                    class="st0"
                    d="M63.79,69.92l-0.22,0.22L5,35.92V13.65h25.92L63.79,69.92z M35.51,122.34l11.85-11.85L5,57.95v-6.66     l63.82,37.74l13.42-13.41L45.59,13.65h7.87l50.24,40.5l12.29-12.3L79.4,13.65h83.06l-22.5,172.69H78.01     C29.06,186.35,5,171.93,5,133.25V82.77L35.51,122.34z"
                  ></path>
                  <path
                    class="st1"
                    d="M315.09,144.09L304.34,43.84h-0.38l-25.74,100.25h-23.04L229.44,43.84h-0.38L218.3,144.09h-20.36     l16.32-126.17h24.97l27.65,105.43h0.39l27.65-105.43h24.97l16.33,126.17H315.09z M432.05,128.54v15.55h-84.5V17.92h84.5v15.56     h-63.37v35.95h59.53v14.86h-59.53v44.25H432.05z M479.86,144.09h-30.73V17.92h30.73c24.71,0,43.37,5.22,55.98,15.64     c12.61,10.43,18.92,25.67,18.92,45.72C554.76,122.48,529.8,144.09,479.86,144.09 M481.78,33.47h-11.52v95.06h11.52     c18.05,0,31.37-3.92,39.95-11.75c8.57-7.84,12.86-20.34,12.86-37.51C534.59,48.74,516.99,33.47,481.78,33.47 M569.93,17.92h23.05     v126.17h-23.05V17.92z M702.63,144.09l-11.33-33.53h-51.85l-11.33,33.53h-21.89l48.01-126.17h23.04l48.01,126.17H702.63z      M665.57,35.2h-0.39L644.63,95.7h41.48L665.57,35.2z"
                  ></path>
                  <path
                    class="st2"
                    d="M815.73,144.09l-45.32-77.43h-0.38v77.43h-31.31V17.92h31.31l45.32,77.43h0.38V17.92h31.11v126.17H815.73z      M968.5,128.62c-11.71,11.46-27.68,17.2-47.91,17.2c-20.23,0-36.24-5.73-48.01-17.2c-11.78-11.47-17.67-27.34-17.67-47.62     c0-20.27,5.89-36.15,17.67-47.61c11.77-11.47,27.78-17.2,48.01-17.2c20.23,0,36.2,5.73,47.91,17.2     c11.71,11.46,17.57,27.34,17.57,47.61C986.07,101.28,980.21,117.15,968.5,128.62 M920.59,40.38c-21.51,0-32.26,13.54-32.26,40.62     c0,27.08,10.75,40.62,32.26,40.62c21.38,0,32.07-13.53,32.07-40.62C952.66,53.93,941.97,40.38,920.59,40.38 M1057.89,144.09     h-34.57L977.81,17.92h34.76l27.66,98h0.38l28.8-98h33.8L1057.89,144.09z M1170.43,144.09l-7.68-27.3h-41.67l-7.49,27.3h-33.99     l45.52-126.17h34.56L1205,144.09H1170.43z M1142.2,43.32h-0.39l-14.4,51.16h29L1142.2,43.32z"
                  ></path>
                </g>
              </g>
            </g>
          </svg>
        </a>
      </div>

    {#if codeChallenge?.challenge.codeChallenge}
      <div
        class="altcha-code-challenge"
        role="dialog"
        aria-label={_strings.verificationRequired}
      >
        <div class="altcha-code-challenge-arrow"></div>

        <form
          data-code-challenge-form="1"
          onsubmitcapture={onCodeChallengeSubmit}
        >
          <img
            class="altcha-code-challenge-image"
            src={codeChallenge.challenge.codeChallenge.image}
            alt=""
          />

          <!-- svelte-ignore a11y_autofocus -->
          <input
            type="text"
            autocomplete="off"
            name="code"
            minlength={codeChallenge.challenge.codeChallenge.length || 1}
            maxlength={codeChallenge.challenge.codeChallenge.length}
            class="altcha-code-challenge-input"
            placeholder={_strings.enterCode}
            aria-label={codeChallengeAudioState === AudioState.LOADING
              ? _strings.loading
              : codeChallengeAudioState === AudioState.PLAYING
                ? ''
                : _strings.enterCodeAria}
            aria-live={codeChallengeAudioState ? 'assertive' : 'polite'}
            aria-busy={codeChallengeAudioState === AudioState.LOADING}
            disabled={codeChallengeSubmitting}
            required
            autofocus={!disableautofocus}
            onkeydown={onCodeChallengeInputKeyDown}
          />

          <div class="altcha-code-challenge-buttons">
            <div class="altcha-code-challenge-buttons-left">
              {#if codeChallenge.challenge.codeChallenge.audio}
                <button
                  type="button"
                  title={_strings.getAudioChallenge}
                  class="altcha-code-challenge-audio"
                  disabled={codeChallengeAudioState === AudioState.LOADING ||
                    codeChallengeAudioState === AudioState.ERROR ||
                    codeChallengeSubmitting}
                  aria-label={codeChallengeAudioState === AudioState.LOADING
                    ? _strings.loading
                    : _strings.getAudioChallenge}
                  onclick={onPlayCodeChallengeAudio}
                >
                  {#if codeChallengeAudioState === AudioState.LOADING}
                    {@render spinner(20)}
                  {:else if codeChallengeAudioState === AudioState.ERROR}
                    <svg
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      ><path
                        d="M12.8659 3.00017L22.3922 19.5002C22.6684 19.9785 22.5045 20.5901 22.0262 20.8662C21.8742 20.954 21.7017 21.0002 21.5262 21.0002H2.47363C1.92135 21.0002 1.47363 20.5525 1.47363 20.0002C1.47363 19.8246 1.51984 19.6522 1.60761 19.5002L11.1339 3.00017C11.41 2.52187 12.0216 2.358 12.4999 2.63414C12.6519 2.72191 12.7782 2.84815 12.8659 3.00017ZM10.9999 16.0002V18.0002H12.9999V16.0002H10.9999ZM10.9999 9.00017V14.0002H12.9999V9.00017H10.9999Z"
                      ></path></svg
                    >
                  {:else if codeChallengeAudioState === AudioState.PLAYING}
                    <svg
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      ><path
                        d="M15 7C15 6.44772 15.4477 6 16 6C16.5523 6 17 6.44772 17 7V17C17 17.5523 16.5523 18 16 18C15.4477 18 15 17.5523 15 17V7ZM7 7C7 6.44772 7.44772 6 8 6C8.55228 6 9 6.44772 9 7V17C9 17.5523 8.55228 18 8 18C7.44772 18 7 17.5523 7 17V7Z"
                      ></path></svg
                    >
                  {:else}
                    <svg
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      ><path
                        d="M4 12H7C8.10457 12 9 12.8954 9 14V19C9 20.1046 8.10457 21 7 21H4C2.89543 21 2 20.1046 2 19V12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12V19C22 20.1046 21.1046 21 20 21H17C15.8954 21 15 20.1046 15 19V14C15 12.8954 15.8954 12 17 12H20C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12Z"
                      ></path></svg
                    >
                  {/if}
                </button>
              {/if}

              <button
                type="button"
                aria-label={_strings.reload}
                title={_strings.reload}
                class="altcha-code-challenge-reload"
                disabled={codeChallengeSubmitting}
                onclick={onCodeChallengeReload}
              >
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  ><path
                    d="M2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2V4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 9.25022 5.38734 6.82447 7.50024 5.38451L7.5 8H9.5V2L3.5 2V4L5.99918 3.99989C3.57075 5.82434 2 8.72873 2 12Z"
                  ></path></svg
                >
              </button>
            </div>

            <button
              type="submit"
              class="altcha-code-challenge-verify"
              disabled={codeChallengeSubmitting}
              aria-label={_strings.verify}
            >
              {#if codeChallengeSubmitting}
                {@render spinner(16)}
              {/if}
              {_strings.verify}
            </button>
          </div>

          {#if codeChallenge.challenge.codeChallenge.audio && playCodeChallengeAudio}
            <audio
              bind:this={elAudio}
              hidden
              autoplay
              onloadstart={onAudioLoadStart}
              oncanplay={onAudioCanPlay}
              onpause={onAudioPause}
              onplaying={onAudioPlaying}
              onended={onAudioEnded}
            >
              <source
                src={getServerUrl(codeChallenge.challenge.codeChallenge.audio, {
                  language,
                })}
                onerror={onAudioError}
              />
            </audio>
          {/if}
        </form>
      </div>
    {/if}
  </div>

  {#if error || currentState === State.EXPIRED}
    <div class="altcha-error">
      <svg
        width="14"
        height="14"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
      {#if currentState === State.EXPIRED}
        <div title={error}>{@html _strings.expired}</div>
      {:else}
        <div title={error}>{@html _strings.error}</div>
      {/if}
    </div>
  {/if}

  {#if _strings.footer}
    <div class="altcha-footer">
      <div>{@html _strings.footer}</div>
    </div>
  {/if}

</div>

{#snippet spinner(size: number = 24)}
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    class="altcha-spinner"
    ><path
      d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
      fill="currentColor"
      opacity=".25"
    /><path
      d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"
      fill="currentColor"
    /></svg
  >
{/snippet}
