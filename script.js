const synth = window.speechSynthesis;

const languageSelect = document.getElementById("languageSelect");
const voiceSelect = document.getElementById("voiceSelect");
const speakButton = document.getElementById("speakButton");
const debugText = document.getElementById("debugText");

let voices = [];

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
    languageSelect.appendChild(option);
  })
}

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
    option.setAttribute("data-lang", voice.lang);
    option.setAttribute("data-name", voice.name);
    voiceSelect.appendChild(option);
  });
  // debug
  debugText.innerHTML = "";
  debugText.innerHTML = `${languageSelect.value} - ${voiceSelect.value}`;
}

function speak({text, voice}) {
  const utterThis = new SpeechSynthesisUtterance(text);
  synth.speak(utterThis);
}

function tellJoke() {
  // const joke = await getJokes(languageSelect.value);
  const joke = 'Warum sollte man nie Cola und Bier gleichzeitig trinken? ... Weil man dann colabiert.';
  console.log(joke);
  speak({text: joke, voice: null});
}

languageSelect.onchange = populateVoices;
speakButton.onclick = tellJoke;

// On load
populateVoices();