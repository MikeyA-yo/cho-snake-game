// SoundManager — Web Audio API synth sounds, no external files needed

let audioCtx = null;

const getCtx = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
};

const playTone = (frequency, duration = 0.1, type = 'square', volume = 0.15) => {
    try {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    } catch (e) {
        // Audio not supported or blocked
    }
};

const SoundManager = {
    eat: () => {
        playTone(880, 0.08, 'square', 0.12);
        setTimeout(() => playTone(1100, 0.08, 'square', 0.1), 50);
    },

    eatStar: () => {
        playTone(880, 0.1, 'sine', 0.15);
        setTimeout(() => playTone(1100, 0.1, 'sine', 0.15), 80);
        setTimeout(() => playTone(1320, 0.15, 'sine', 0.12), 160);
    },

    powerUp: () => {
        playTone(523, 0.1, 'sine', 0.15);
        setTimeout(() => playTone(659, 0.1, 'sine', 0.15), 100);
        setTimeout(() => playTone(784, 0.15, 'sine', 0.12), 200);
        setTimeout(() => playTone(1047, 0.2, 'sine', 0.1), 300);
    },

    levelUp: () => {
        const notes = [523, 659, 784, 1047, 1319];
        notes.forEach((freq, i) => {
            setTimeout(() => playTone(freq, 0.15, 'sine', 0.12), i * 80);
        });
    },

    combo: (level) => {
        const baseFreq = 600 + (level * 100);
        playTone(baseFreq, 0.06, 'sawtooth', 0.08);
        setTimeout(() => playTone(baseFreq + 200, 0.06, 'sawtooth', 0.06), 40);
    },

    die: () => {
        playTone(400, 0.15, 'sawtooth', 0.2);
        setTimeout(() => playTone(300, 0.15, 'sawtooth', 0.18), 100);
        setTimeout(() => playTone(200, 0.2, 'sawtooth', 0.15), 200);
        setTimeout(() => playTone(100, 0.4, 'sawtooth', 0.1), 300);
    },

    move: () => {
        // Very subtle tick — only call occasionally
        playTone(200, 0.02, 'sine', 0.03);
    },
};

export default SoundManager;
