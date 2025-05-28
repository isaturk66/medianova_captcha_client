
<template>
  <form id="captchaForm" action="#" method="post">
    <h1>Prove you're human</h1>

    <!-- Altcha widget emits `statechange` → update `status` -->
    <altcha-widget
      id="altcha"
      :debug="isDev"
      :challengeurl="challengeUrl"
      :verifyurl="verifyUrl"
      @statechange="status = $event.detail.state"
    />

    <!-- Contextual feedback -->
    <p v-if="status !== 'unverified'" :class="['feedback', status]">
      {{ messages[status] }}
    </p>
  </form>
</template>


<script setup lang="ts">
/* ──────────────────────────────
   CRITICAL: build-time env vars, do not edit.
   ────────────────────────────── */
const challengeUrl = import.meta.env.VITE_CHALLENGE_URL;
const verifyUrl    = import.meta.env.VITE_VERIFY_URL;
const isDev        = import.meta.env.DEV;

/* ────────────────────────────── */

// This section demonstrates how the state of the Altcha Widget can be used to change state at vue side.
// This will need to be used for at least handling the "error" state which means the verification failed for a user.
import { ref } from 'vue';

type AltchaState =
  | 'code'
  | 'error'
  | 'verified'
  | 'verifying'
  | 'unverified'
  | 'expired';

const status = ref<AltchaState>('unverified');

const messages: Record<AltchaState, string> = {
  code:      'Enter the code you hear/see.',
  error:     'Verification failed. Please try again.',
  verified:  'Success! You are verified.',
  verifying: 'Checking…',
  unverified:'',
  expired:   'Challenge expired. Reload to try again.',
};
</script>


<style scoped>
h1                { margin-bottom: 1rem; }
.feedback         { margin-top: .5rem; font-weight: 600; }
.feedback.error    { color: #e53935; }
.feedback.verified { color: #43a047; }
.feedback.verifying{ color: #fbc02d; }
.feedback.expired  { color: #fb8c00; }
.feedback.code     { color: #1565c0; }
</style>

<style scoped>
h1 { margin-bottom: 1rem; }
.feedback { margin-top: 0.5rem; font-weight: 600; }
.feedback.error { color: #e53935; }
.feedback.verified { color: #43a047; }
.feedback.verifying { color: #fbc02d; }
.feedback.expired { color: #fb8c00; }
.feedback.code { color: #1565c0; }
</style>
