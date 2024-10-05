'use strict';
const speechApi = new SpeechApi();
const languageSelectElement = document.getElementById("languageSelect");
const voiceSelectElement = document.getElementById("voiceSelect");
const speakButtonElement = document.getElementById("speakButton");

/**
 * Fills the language select element with the languages given in the languages array.
 * Each language is represented as an object with a 'short' and a 'label' property.
 * The 'short' property is used as the value for the option element and the 'label'
 * property is used as the textContent of the option element.
 */
function populateLanguages() {
  const languages = [
    {'short': 'de', 'label': 'German'},
    {'short': 'en', 'label': 'English'},
    {'short': 'es', 'label': 'Spanish'},
    {'short': 'fr', 'label': 'French'},
    {'short': 'it', 'label': 'Italian'},
    {'short': 'pt', 'label': 'Portuguese'},
    {'short': 'ru', 'label': 'Russian'},
  ];
  languages.forEach((lang) => {
    const option = document.createElement("option");
    option.textContent = lang.label;
    option.setAttribute("value", lang.short);
    languageSelectElement.appendChild(option);
  })
}

/**
 * Populates the voice select element with the voices available for the given
 * language. The language is given as a ISO 639-1 language code (e.g. "de", "en", ...).
 * If no language is given, the default "de" is used.
 * @param {string} [lang="de"] The language code for which to populate the voices.
 */
function populateVoices(lang = "de") {
  if (voiceSelectElement.children.length > 0) {
    voiceSelectElement.innerHTML = "";
  }
  speechApi
    .loadVoices()
    .then((voices) => {
      voices.filter((voice) => String(voice.lang).startsWith(lang)).forEach((voice) => {
        const option = document.createElement("option");
        option.textContent = `${voice.name} (${voice.lang})`;
        option.setAttribute("data-lang", voice.lang);
        option.setAttribute("data-name", voice.name);
        voiceSelectElement.appendChild(option);
      })
    })
    .catch((error) => {
      console.error(
        "Error loading voices in function populateVoices:\n",
        error
      );
    });
}

/**
 * Loads the speech controls. If the language select element is empty,
 * it populates it with the languages. Then it populates the voice select
 * element with the voices for the selected language.
 */
function loadSpeechControls() {
  if (languageSelectElement.children.length === 0) {
    populateLanguages();  
  }
  populateVoices(languageSelectElement.value);
}

/**
 * Speaks a joke in the selected language.
 * The joke is fetched from the jokeapi.dev API.
 * If the selected language is not supported, a default joke in English is used.
 * The voice is selected from the voices available for the selected language.
 * If no voice is selected, a default voice for the selected language is used.
 * The function uses the Web Speech API to synthesize the joke.
 */
function tellJoke() {
  const lang = languageSelectElement.value;
  const apiUrl = `https://v2.jokeapi.dev/joke/Any?lang=${lang}`;
  
  fetch(apiUrl)
  .then((response) => response.json())
  .then((data) => {
    let joke = '';
    if (data.setup) {
      joke = `${data.setup} ... ${data.delivery}`;
    } else {
      joke = data.joke;
    }
    
    speechApi.loadVoices()
      .then((voices) => {
        let voice;

        if (joke == null) {
          joke = "Sorry! ... No joke found.";
          voice = voices.filter((voice) => String(voice.lang).startsWith('en'))[0]
        } else {
          const selectedVoiceName = voiceSelectElement.options[voiceSelectElement.selectedIndex].getAttribute("data-name");
          voice = voices.filter((voice) => voice.name === selectedVoiceName)[0]
        }

        const synth = window.speechSynthesis;
        const utterThis = new SpeechSynthesisUtterance();

        utterThis.text = joke;
        utterThis.voice = voice;
        utterThis.voiceURI = 'native';
        utterThis.lang = voice.lang;
        utterThis.rate = 1;
        utterThis.pitch = 1;

        synth.cancel(); // cancel current speak, if any is running
        synth.speak(utterThis);

        utterThis.onstart = function(event) {
          console.debug('Utterance has started being spoken.');
        }

        utterThis.onend = function(event) {
          console.debug('Utterance has finished being spoken after ' + event.elapsedTime + ' milliseconds.');
        }
      })
      .catch((error) => console.error("Error loading voice in function tellJoke:\n", error));
  }).catch((error) => {
    console.error("Error loading joke in function tellJoke:\n", error);
  });
}

// On load
loadSpeechControls();

// Interactions
languageSelectElement.addEventListener("change", loadSpeechControls);
speakButtonElement.addEventListener("click", tellJoke);