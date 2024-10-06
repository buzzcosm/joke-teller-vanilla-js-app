const synth = window.speechSynthesis;

const languageSelect = document.getElementById("languageSelect");
const voiceSelect = document.getElementById("voiceSelect");
const jokeInput = document.getElementById("jokeInput");
const speakButton = document.getElementById("speakButton");

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
  console.log('language:', languageSelect.value);
}

function speak() {
  const joke = 'Warum sollte man nie Cola und Bier gleichzeitig trinken? ... Weil man dann colabiert.';
  // const joke = await getJokes(languageSelect.value);
  console.log(joke);
  const utterThis = new SpeechSynthesisUtterance(joke);
  synth.speak(utterThis);
}

languageSelect.onchange = populateVoices;
speakButton.onclick = speak;

// On load
populateVoices();