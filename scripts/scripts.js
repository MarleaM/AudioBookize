let currentUtterance = null; // To keep track of the current utterance
let isPaused = false; // To track if speech is paused
let preferredVoice = null; // To store the preferred voice

// Function to get the preferred voice
function getPreferredVoice() {
    if (preferredVoice) return preferredVoice;
    
    const voices = speechSynthesis.getVoices();
    preferredVoice = voices.find(voice => voice.name === 'Google US English'); // Adjust this as needed
    return preferredVoice;
}

// Wait for voices to load
speechSynthesis.onvoiceschanged = function() {
    // Initialize the preferred voice if not already set
    getPreferredVoice();
};

document.getElementById('text-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    // Get the text from the textarea
    const userText = document.getElementById('userText').value;

    // Get the volume from the slider
    const volume = parseFloat(document.getElementById('volumeControl').value);

    // Check if text is not empty
    if (userText.trim() !== '') {
        // Cancel any ongoing speech
        if (currentUtterance) {
            speechSynthesis.cancel();
        }

        // Create a new SpeechSynthesisUtterance object
        const utterance = new SpeechSynthesisUtterance(userText);

        // Set the voice, pitch, and rate (optional)
        const voice = getPreferredVoice();
        if (voice) {
            utterance.voice = voice;
        }
        utterance.pitch = 1; // Adjust pitch (0 - 2)
        utterance.rate = 1; // Adjust rate (0.1 - 10)
        utterance.volume = volume; // Set the initial volume

        // Update currentUtterance
        currentUtterance = utterance;

        // Event listeners for handling speech
        utterance.onstart = function() {
            isPaused = false; // Reset paused state
        };

        utterance.onpause = function() {
            isPaused = true;
        };

        utterance.onend = function() {
            isPaused = false; // Reset paused state
        };

        // Speak the text
        speechSynthesis.speak(utterance);

    } else {
        // Handle case where text is empty
        document.getElementById('response-message').innerHTML = '<p>Please enter some text to read aloud.</p>';
    }
});

// Add an event listener to update the volume when the slider changes
document.getElementById('volumeControl').addEventListener('input', function() {
    const volume = parseFloat(this.value);

    if (currentUtterance) {
        // Pause current speech
        if (!isPaused) {
            speechSynthesis.pause();
        }

        // Set the new volume
        currentUtterance.volume = volume;

        // Resume the speech with the new volume
        if (isPaused) {
            speechSynthesis.resume();
        }
    }
});
