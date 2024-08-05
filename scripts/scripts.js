let currentUtterance = null; 
let isPaused = false;
let preferredVoice = null; 
let textQueue = []; 
let currentIndex = 0; 

function getPreferredVoice() {
    if (preferredVoice) return preferredVoice;
    const voices = speechSynthesis.getVoices();
    preferredVoice = voices.find(voice => voice.name === 'Google US English'); 
    return preferredVoice;
}

speechSynthesis.onvoiceschanged = function() {t
    getPreferredVoice();
};

function splitTextIntoChunks(text, chunkSize = 200) {
    const regex = new RegExp(`.{1,${chunkSize}}(\\s|$)`, 'g');
    return text.match(regex) || [];
}

document.getElementById('text-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const userText = document.getElementById('userText').value;

    const volume = parseFloat(document.getElementById('volumeControl').value);

    if (userText.trim() !== '') {
        if (currentUtterance) {
            speechSynthesis.cancel();
        }

        textQueue = splitTextIntoChunks(userText);
        currentIndex = 0;

        if (textQueue.length > 0) {
            speakChunk(textQueue[currentIndex], volume);
        }
    } else {
        document.getElementById('response-message').innerHTML = '<p>Please enter some text to read aloud.</p>';
    }
});

function speakChunk(text, volume) {
    const utterance = new SpeechSynthesisUtterance(text);

    const voice = getPreferredVoice();
    if (voice) {
        utterance.voice = voice;
    }
    utterance.pitch = 1; 
    utterance.rate = 1; 
    utterance.volume = volume; 

    currentUtterance = utterance;

    utterance.onstart = function() {
        isPaused = false; 
    };

    utterance.onpause = function() {
        isPaused = true;
    };

    utterance.onend = function() {
        isPaused = false; 
        currentIndex++;
        if (currentIndex < textQueue.length) {
            speakChunk(textQueue[currentIndex], volume);
        } else {
            document.getElementById('response-message').innerHTML = '<p>Reading completed.</p>';
        }
    };

    speechSynthesis.speak(utterance);

    document.getElementById('response-message').innerHTML = '<p>Reading aloud...</p>';
}

document.getElementById('volumeControl').addEventListener('input', function() {
    const volume = parseFloat(this.value);

    if (currentUtterance) {
        if (!isPaused) {
            speechSynthesis.pause();
        }

        currentUtterance.volume = volume;

        if (isPaused) {
            speechSynthesis.resume();
        }
    }
});
