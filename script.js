const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const hirajoshiIntervals = [0, 2, 3, 7, 8]; // semitones from root

const rootSelect = document.getElementById('root');
notes.forEach(note => {
  const opt = document.createElement('option');
  opt.value = note;
  opt.textContent = note;
  rootSelect.appendChild(opt);
});

let currentRoot = 'A';

rootSelect.addEventListener('change', () => {
  currentRoot = rootSelect.value;
  renderAll();
});

function getScale(root) {
  const rootIndex = notes.indexOf(root);
  return hirajoshiIntervals.map(i => notes[(rootIndex + i) % 12]);
}

function renderPiano(scale) {
  const piano = document.getElementById('piano');
  piano.innerHTML = '';
  
  for (let i = 0; i < 24; i++) { // two octaves
    const note = notes[i % 12];
    const key = document.createElement('div');
    key.className = `key ${note.includes('#') ? 'black' : 'white'}`;
    key.textContent = note;
    
    if (scale.includes(note)) key.classList.add('highlight');
    piano.appendChild(key);
  }
}

function renderGuitar(scale) {
  const guitar = document.getElementById('guitar');
  guitar.innerHTML = '';
  
  // Simple 12-fret representation (6 strings)
  for (let string = 0; string < 6; string++) {
    const openNoteIndex = [4, 11, 7, 2, 9, 4][string]; // E A D G B E
    for (let fret = 0; fret < 13; fret++) {
      const noteIndex = (openNoteIndex + fret) % 12;
      const note = notes[noteIndex];
      
      const div = document.createElement('div');
      div.className = 'fret';
      div.textContent = scale.includes(note) ? note : '';
      if (scale.includes(note)) div.style.background = '#ffcc66';
      guitar.appendChild(div);
    }
  }
}

function renderAll() {
  const scale = getScale(currentRoot);
  document.getElementById('notes-display').textContent = scale.join(' – ') + ` – ${currentRoot}`;
  renderPiano(scale);
  renderGuitar(scale);
}

// Simple Web Audio playback
let audioContext;
function initAudio() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

function playNote(freq, duration = 400) {
  initAudio();
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.value = 0.3;
  
  osc.connect(gain).connect(audioContext.destination);
  osc.start();
  setTimeout(() => {
    gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.05);
    osc.stop(audioContext.currentTime + 0.3);
  }, duration);
}

function playScale() {
  const scale = getScale(currentRoot);
  let delay = 0;
  const baseFreq = 261.63; // C4
  
  scale.forEach((note, i) => {
    const noteIndex = notes.indexOf(note);
    const semitones = (noteIndex + 12) % 12; // relative to C
    const freq = baseFreq * Math.pow(2, semitones / 12);
    
    setTimeout(() => playNote(freq, 500), delay);
    delay += 400;
  });
}

document.getElementById('play-scale').addEventListener('click', playScale);
document.getElementById('play-arpeggio').addEventListener('click', () => {
  // similar but different rhythm
  const scale = getScale(currentRoot);
  let delay = 0;
  scale.forEach(note => {
    const noteIndex = notes.indexOf(note);
    const freq = 261.63 * Math.pow(2, ((noteIndex + 12) % 12) / 12);
    setTimeout(() => playNote(freq, 600), delay);
    delay += 300;
  });
});

// Init
renderAll();
