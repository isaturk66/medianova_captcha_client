<template>
  <form id="captchaForm" action="#" method="post">
    <h1>Prove you're human</h1>

    <!-- Altcha custom-element just works in Vue --> 
    <altcha-widget
      id="altcha"
      debug
      challengeurl="/captcha/1/challenge"
      verifyurl="/captcha/1/challenge"
    />
      <!-- Change This url -->

    <div class="buttons">
      <button type="submit">Submit</button>
      <button type="reset">Reset</button>
    </div>
  </form>
</template>


<style scoped>
h1 { margin-bottom: 1rem; }
.buttons { margin-top: 1rem; display: flex; gap: .5rem; }
</style>
