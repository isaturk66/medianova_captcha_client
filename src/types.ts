export interface Strings {
  ariaLinkLabel: string;
  enterCode: string;
  enterCodeAria: string;
  error: string;
  expired: string;
  footer: string;
  getAudioChallenge: string;
  label: string;
  loading: string;
  reload: string;
  verified: string;
  verificationRequired: string;
  verifying: string;
  waitAlert: string;
}

export interface Configure {
  mode?: 'non-interactive' | 'semi-interactive' | 'interactive';
  challenge?: Challenge | string;
  challengeurl?: string;
  credentials?: 'omit' | 'same-origin' | 'include' | boolean | undefined;
  customfetch?: string | CustomFetchFunction;
  debug?: boolean;
  delay?: number;
  disableautofocus?: boolean;
  expire?: number;
  language?: string;
  maxnumber?: number;
  mockerror?: boolean;
  name?: string;
  refetchonexpire?: boolean;
  strings?: Partial<Strings> | string;
  test?: boolean | number | 'delay';
  verifyurl?: string;
  workers?: number;
  workerurl?: string;
}

export interface ServerVerificationPayload {
  payload: string;
}

export interface Solution {
  number: number;
  took: number;
  worker?: boolean;
}

export interface Challenge {
  codeChallenge?: {
    audio?: string;
    image: string;
    length?: number;
  };
  algorithm: string;
  challenge: string;
  maxnumber?: number;
  maxNumber?: number;
  salt: string;
  signature: string;
}

export interface Payload {
  algorithm: string;
  challenge: string;
  number: number;
  salt: string;
  signature: string;
  test?: boolean;
  took: number;
}

export interface Obfuscated {
  obfuscated: string;
  key?: string;
  maxnumber?: number;
  maxNumber?: number;
}

export interface ClarifySolution {
  clearText: string;
  took: number;
  worker?: boolean;
}

export interface PluginContext {
  el: HTMLElement;
  dispatch: <T>(event: string, detail?: T) => void;
  getConfiguration(): Configure;
  getState(): State;
  log(...args: unknown[]): void;
  reset(state?: State, err?: string | null): void;
  solve(data: Challenge | Obfuscated): Promise<{
    data: Challenge | Obfuscated;
    solution: Solution | ClarifySolution | null;
  }>;
  setState(state: State, err?: string | null): void;
  verify(): Promise<void>;
}

export enum State {
  CODE = 'code',
  ERROR = 'error',
  VERIFIED = 'verified',
  VERIFYING = 'verifying',
  UNVERIFIED = 'unverified',
  EXPIRED = 'expired',
}

export enum AudioState {
  ERROR = 'error',
  LOADING = 'loading',
  PLAYING = 'playing',
  PAUSED = 'paused',
  READY = 'ready',
}

export type CustomFetchFunction = (url: string, init?: RequestInit) => Promise<Response>;