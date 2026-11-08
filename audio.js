// Web Audio API를 활용한 순수 자바스크립트 사운드 신시사이저
class SoundController {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.bgmPlaying = false;
    this.bgmInterval = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.bgmPlaying) {
      this.stopBGM();
    } else if (!this.isMuted && !this.bgmPlaying) {
      this.startBGM();
    }
    return this.isMuted;
  }

  // 밥 쥐는 소리 (찰지고 부드러운 퍽 소리)
  playRice() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  // 와사비 바르는 소리 (톡 쏘는 짧은 쇽!)
  playWasabi() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // 토핑 얹는 소리 (찰싹! 퐁!)
  playTopping() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.15);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  // 서빙 성공 & 벨 소리 (맑은 팅~!)
  playServe() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;

    [1046.5, 1318.51, 1567.98].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0.25, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.45);
    });
  }

  // 동전 획득 사운드 (동전 챠링!)
  playCoin() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  // 실수 / 쓰레기통 / 잘못된 서빙 (삑- 둔탁한 소리)
  playError() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.2);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // 손님 화내며 퇴장
  playAngry() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.3);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  // 콤보 피버 팡파레
  playCombo() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.2, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.25);
    });
  }

  // 가볍고 편안한 일본식 스시야 배경음악 (절제된 펜타토닉 멜로디 루프)
  startBGM() {
    if (this.isMuted || this.bgmPlaying) return;
    this.init();
    this.bgmPlaying = true;

    // 미야코부시/펜타토닉 음계 (D, Eb, G, A, Bb)
    const melody = [
      { note: 293.66, dur: 0.2 }, // D4
      { note: 329.63, dur: 0.2 }, // E4
      { note: 392.00, dur: 0.3 }, // G4
      { note: 440.00, dur: 0.2 }, // A4
      { note: 523.25, dur: 0.3 }, // C5
      { note: 440.00, dur: 0.2 }, // A4
      { note: 392.00, dur: 0.4 }, // G4
      { note: 329.63, dur: 0.2 }, // E4
      { note: 293.66, dur: 0.4 }, // D4
    ];

    let noteIdx = 0;
    const beatMs = 380;

    this.bgmInterval = setInterval(() => {
      if (!this.bgmPlaying || this.isMuted) return;
      const m = melody[noteIdx];
      const now = this.ctx.currentTime;

      // 멜로디 오실레이터 (따뜻한 실로폰/고토 느낌)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(m.note, now);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + m.dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + m.dur);

      noteIdx = (noteIdx + 1) % melody.length;
    }, beatMs);
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

window.soundCtrl = new SoundController();
