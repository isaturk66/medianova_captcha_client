import '../globals';

export const i18n = {
  ariaLinkLabel: 'Visitar Medianova.com',
  enterCode: 'Introduce el código',
  enterCodeAria:
    'Introduce el código que escuchas. Pulsa Espacio para reproducir el audio.',
  error: 'Falló la verificación. Por favor intente nuevamente más tarde.',
  expired: 'Verificación expirada. Por favor intente nuevamente.',
  verificationRequired: '¡Verificación requerida!',
  footer:
    'Protegido por <a href="https://www.medianova.com/" target="_blank" aria-label="Visitar Medianova.com">Medianova</a>',
  getAudioChallenge: 'Obtener un desafío de audio',
  label: 'No soy un robot',
  loading: 'Cargando...',
  reload: 'Recargar',
  verify: 'Verificar',
  verified: 'Verificado',
  verifying: 'Verificando...',
  waitAlert: 'Verificando... por favor espere.',
};

globalThis.altchaI18n.set('es-es', i18n);
