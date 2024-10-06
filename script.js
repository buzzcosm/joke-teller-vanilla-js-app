const synth = window.speechSynthesis;

const languageSelect = document.getElementById("languageSelect");
const voiceSelect = document.getElementById("voiceSelect");
const speakButton = document.getElementById("speakButton");
const jokeParagraph = document.getElementById("jokeParagraph");
// const speakEvent = new CustomEvent("speak");
const customEvent = new CustomEvent("myCustomEvent");

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
}

function speak() {
  const text = jokeParagraph.textContent;
  // const text = 'Habe übrigens ein Blatt gelocht ... aber das nur am Rande!'
  if (text !== "") {
    const utterThis = new SpeechSynthesisUtterance(text);

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
}

function tellJoke() {
  getJokes(languageSelect.value).then((joke) => {
    jokeParagraph.textContent = joke;
    document.dispatchEvent(customEvent); // Dispatch Custom-Event
  })
   // Löst das Custom-Event auf document aus
  // getJokes(languageSelect.value).then((joke) => {
  //   console.log(joke);
  //   speak();
  // });
}

// async function saveJoke() {
//   const language = languageSelect.value || 'en';
//   const joke = await getJokes(language);
//   jokeParagraph.textContent = joke;
//   jokeParagraph.dispatchEvent(speakEvent);
// }

// On load
populateVoices();

// Event listeners
languageSelect.onchange = populateVoices;
speakButton.onclick = tellJoke;
document.addEventListener("myCustomEvent", () => {
  console.log("Das myCustomEvent wurde auf dem Dokument ausgelöst.");
  speak();
});
// jokeParagraph.addEventListener("speak", speak);
