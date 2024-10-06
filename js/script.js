const synth = window.speechSynthesis;

const languageSelect = document.getElementById("languageSelect");
const voiceSelect = document.getElementById("voiceSelect");
const speakButton = document.getElementById("speakButton");

let voices = [];

function disableElements() {
  languageSelect.disabled = true;
  voiceSelect.disabled = true;
  speakButton.disabled = true;
}

function enableElements() {
  languageSelect.disabled = false;
  voiceSelect.disabled = false;
  speakButton.disabled = false;
}

/**
 * Fetches a joke from the jokeapi.dev API and returns the joke in a string.
 * If the joke has a setup and delivery, they are concatenated with ' ... '.
 * If no language is given, the default 'en' is used.
 * @param {string} [language='en'] The language code for which to get a joke.
 * @returns {string} The fetched joke.
 */
async function getJokes(language = 'en') {
  let joke;
  const apiUri = `https://v2.jokeapi.dev/joke/Any?lang=${language}`;
  try {
    const response = await fetch(apiUri);
    const data = await response.json();
    if (data.setup) {
      joke = `${data.setup} ... ${data.delivery}`;
    } else {
      joke = data.joke;
    }
    return joke;
  } catch (error) {
    console.error(error);
  }
}

/**
 * Returns a promise that resolves with an array of SpeechSynthesisVoice objects.
 * If voices are already loaded, the promise is resolved immediately.
 * If voices are not loaded yet, the function waits for the 'voiceschanged' event
 * and resolves the promise with the loaded voices.
 * If no voices are available, the promise is rejected with a message.
 * @returns {Promise<SpeechSynthesisVoice[]>} A promise with the loaded voices.
 */
function getVoices() {
  return new Promise((resolve, reject) => {
    // Check if voices are already loaded
    voices = synth.getVoices();
    if (voices.length > 0) {
      resolve(voices);
    } else {
      // Wait for the event if voices are not loaded yet
     synth.onvoiceschanged = () => {
        voices = synth.getVoices();
        if (voices.length > 0) {
          resolve(voices); // Resolve promise with loaded voices
        } else {
          reject('No voices available');
        }
      };
    }
  });
}

/**
 * Populates the language select element with the languages given in the languages array.
 * Each language is represented as an object with a 'short', 'label', and 'active' property.
 * The 'short' property is used as the value for the option element and the 'label'
 * property is used as the textContent of the option element.
 * If a language's 'active' property is set to false, it is not added to the select element.
 * The select element is cleared before populating with the languages.
 */
function populateLanguages() {
  const languages = [
    {'short': 'en', 'label': 'English', 'active': true},
    {'short': 'de', 'label': 'German', 'active': true},
    {'short': 'cs', 'label': 'Czech', 'active': true},
    {'short': 'es', 'label': 'Spanish', 'active': true},
    {'short': 'fr', 'label': 'French', 'active': true},
    {'short': 'pt', 'label': 'Portuguese', 'active': true},
    {'short': 'it', 'label': 'Italian', 'active': false},
    {'short': 'ru', 'label': 'Russian', 'active': false},
  ];
  languages.filter((lang) => lang.active).forEach((lang) => {
    const option = document.createElement("option");
    option.textContent = lang.label;
    option.setAttribute("value", lang.short);
    languageSelect.appendChild(option);
  })
}

/**
 * Populates the voice select element with the voices available for the currently selected language.
 * If the language select element is empty, it is populated with the languages first.
 * If the voices array is empty, it is populated with the available voices first.
 * The voice select element is cleared before populating with the voices.
 * The voices are filtered by the selected language and the 'default' property is used to add a label.
 * The 'data-lang' and 'data-name' attributes are set on the option elements.
 */
async function populateVoices() {
  if (languageSelect.children.length === 0) {
    populateLanguages();
  }
  if (voices.length === 0) {
    await getVoices();
  }
  if (voiceSelect.children.length > 0) {
    voiceSelect.innerHTML = "";
  }
  const filteredVoices = voices.filter((voice) => String(voice.lang).startsWith(languageSelect.value));
  filteredVoices.map((voice) => {
    const option = document.createElement("option");
    option.textContent = `${voice.name} (${voice.lang})`;
    if (voice.default) {
      option.textContent += " -- DEFAULT";
    }
    option.setAttribute("data-lang", voice.lang);
    option.setAttribute("data-name", voice.name);
    voiceSelect.appendChild(option);
  });
}

/**
 * Required in mobile browsers to ensure 
 * correct functionality with speech synthesis 
 * after asynchronous joke retrieval.
 */
function speakPlaceholder() {
  const placeholder = '';
  const utterThis = new SpeechSynthesisUtterance(placeholder);
  synth.speak(utterThis);
}

async function tellJoke() {
  // dummy startup
  speakPlaceholder();
  
  // tell joke
  const joke = await getJokes(languageSelect.value);
  console.log(joke);

  const utterThis = new SpeechSynthesisUtterance(joke);

  utterThis.onstart = (event) => {
    disableElements();
    console.log(`We have started uttering this speech: ${event.utterance.text}`);
  };

  utterThis.onend = (event) => {
    enableElements();
    console.log(`Utterance has finished being spoken after ${event.elapsedTime} seconds.`);
  };

  utterThis.onerror = (event) => {
    console.log(
      `An error has occurred with the speech synthesis: ${event.error}`,
    );
  };

  const selectedVoiceName = voiceSelect.selectedOptions[0].getAttribute("data-name");
    
  for (let i = 0; i < voices.length; i++) {
    if (voices[i].name === selectedVoiceName) {
      utterThis.voice = voices[i];
      break;
    }
  }

  synth.speak(utterThis);
}

// Event listeners
window.onload = populateVoices;
languageSelect.onchange = populateVoices;
speakButton.onclick = tellJoke;