const synth = window.speechSynthesis;

const languageSelect = document.getElementById("languageSelect");
const voiceSelect = document.getElementById("voiceSelect");
const jokeInput = document.getElementById("jokeInput");
const speakButton = document.getElementById("speakButton");




speakButton.onclick = () => {
  if (jokeInput.value) {
    // simple text-to-speech configuration
    const utterThis = new SpeechSynthesisUtterance(jokeInput.value);
    synth.speak(utterThis);
  }
}