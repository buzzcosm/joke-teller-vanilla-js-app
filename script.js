const synth = window.speechSynthesis;

const languageSelect = document.getElementById("languageSelect");
const voiceSelect = document.getElementById("voiceSelect");
const jokeInput = document.getElementById("jokeInput");
const speakButton = document.getElementById("speakButton");

let voices = [];

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

function populateVoiceList() {
  const language = languageSelect.value || 'en';
  voices = synth.getVoices().filter(function (voice) { return voice.lang.includes(language); }).sort(function (a, b) {
    const aname = a.name.toUpperCase();
    const bname = b.name.toUpperCase();

    if (aname < bname) {
      return -1;
    } else if (aname == bname) {
      return 0;
    } else {
      return +1;
    }
  });
  const selectedIndex = voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;
  voiceSelect.innerHTML = "";

  for (let i = 0; i < voices.length; i++) {
    const option = document.createElement("option");
    option.textContent = `${voices[i].name} (${voices[i].lang})`;

    if (voices[i].default) {
      option.textContent += " -- DEFAULT";
    }

    option.setAttribute("data-lang", voices[i].lang);
    option.setAttribute("data-name", voices[i].name);
    voiceSelect.appendChild(option);
  }
  voiceSelect.selectedIndex = selectedIndex;
}

function loadVoiceList() {
  if (languageSelect.children.length === 0) {
    populateLanguages();  
  }
  populateVoiceList();
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
  }
}

// get joke from API
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

async function tellJoke() {
  // const selectedIndex = voiceSelect.selectedIndex;
  // const selectedOption = voiceSelect.options[selectedIndex]
  // const selectedLang = selectedOption.getAttribute('data-lang');
  // const selectedVoices = selectedOption.getAttribute('data-name');
  // console.log(selectedIndex);
  // console.log(selectedOption);
  // console.log(selectedLang);
  // console.log(selectedVoices);

  // const voiceName = voiceSelect.options[voiceSelect.selectedIndex].getAttribute('data-name');

  const joke = await getJokes(languageSelect.value);

  const utterThis = new SpeechSynthesisUtterance(joke);

  utterThis.onend = function (event) {
    console.log("SpeechSynthesisUtterance.onend");
  };

  utterThis.onerror = function (event) {
    console.error("SpeechSynthesisUtterance.onerror");
  };

  const selectedOption = voiceSelect.selectedOptions[0].getAttribute("data-name");

  for (let i = 0; i < voices.length; i++) {
    if (voices[i].name === selectedOption) {
      utterThis.voice = voices[i];
      break;
    }
  }
  
  synth.speak(utterThis);
}

function speak() {
  const joke = 'Warum sollte man nie Cola und Bier gleichzeitig trinken? ... Weil man dann colabiert.';
  const utterThis = new SpeechSynthesisUtterance(joke);
  synth.speak(utterThis);
}

// languageSelect.onchange = loadVoiceList;
speakButton.onclick = speak;

// On load
// loadVoiceList();