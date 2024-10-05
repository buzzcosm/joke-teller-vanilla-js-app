/**
 * https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
 */

export function setSpeech() {
  return new Promise((resolve) => {
      let synth = window.speechSynthesis;

      synth.addEventListener('voiceschanged', () => {
          resolve(synth.getVoices());
      });

      if (synth.getVoices().length !== 0) {
          resolve(synth.getVoices());
      }
  });
}