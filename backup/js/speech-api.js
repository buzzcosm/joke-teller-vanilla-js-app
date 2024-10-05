class SpeechApi {
  constructor() {
    this.voices = [];
  }

  // Method to load available voices
  loadVoices() {
    return new Promise((resolve, reject) => {
      // Check if voices are already loaded
      this.voices = window.speechSynthesis.getVoices();
      if (this.voices.length > 0) {
        resolve(this.voices);
      } else {
        // Wait for the event if voices are not loaded yet
        window.speechSynthesis.onvoiceschanged = () => {
          this.voices = window.speechSynthesis.getVoices();
          if (this.voices.length > 0) {
            resolve(this.voices); // Resolve promise with loaded voices
          } else {
            reject('No voices available');
          }
        };
      }
    });
  }
}