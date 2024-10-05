import * as speechApi from './data/speech-api.js';
import * as jokeApi from './data/joke-api.js';

const button = document.getElementById('button');
const languagesSelector = document.getElementById("select-lang");
const voiceSelector = document.getElementById("select-voice");

const voices = await speechApi.setSpeech();
const localizations = [
  { label: "German", locale: "de-DE", code: 'de'},
  { label: "English", locale: "en-US", code: 'en'},
  { label: "Spanish", locale: "es-ES", code: 'es'},
  { label: "Portugese", locale: "pt-BR", code: 'pt'},
];

// init client
(() => {
  // load languages
  for (const localization of localizations) {
    const option = document.createElement("option");
    option.textContent = localization.label;
    option.value = localization.code;
    languagesSelector.appendChild(option);
  }
  // load voices
  loadVoices();
})();

function loadVoices() {
  const locale = localizations.find(localization => localization.code === languagesSelector.value).locale;
  // create voice selector options
  if (voiceSelector.childElementCount > 0) {
      voiceSelector.innerHTML = '';
  }
  for (const voice of voices.filter(voice => voice.lang === locale)) {
      const option = document.createElement("option");
      option.textContent = `${voice.name}`;
      option.setAttribute("data-lang", voice.lang);
      option.setAttribute("data-name", voice.name);
      voiceSelector.appendChild(option);
  }
}

function getVoice() {
  const name = voiceSelector.value;
  const locale = voiceSelector.options[voiceSelector.selectedIndex].getAttribute("data-lang");
  return voices.find(voice => (voice.name === name && voice.lang === locale));
}

async function tellJoke() {
  let joke = await jokeApi.getJoke(languagesSelector.value);
  let voice = getVoice();
  let utterance = new SpeechSynthesisUtterance();

  // debugger
  // console.log('debugg function tellJoke - joke:\n', joke);
  // console.log('debugg function tellJoke - voice:\n', voice);

  utterance.text = joke;
  utterance.voice = voice;

  window.speechSynthesis.speak(utterance);
  
  // disable control elements during speech
  toggleElements();
  utterance.addEventListener("end", toggleElements);
}

// Disable/Enable Button
function toggleElements() {
  button.disabled = !button.disabled;
  languagesSelector.disabled = !languagesSelector.disabled;
  voiceSelector.disabled = !voiceSelector.disabled;
}

button.addEventListener('click', tellJoke);
languagesSelector.addEventListener('change', loadVoices);