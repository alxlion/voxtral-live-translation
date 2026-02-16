class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._buffer = [];
    this._bufferSize = 0;
    // Send ~100ms of 16kHz audio: 1600 samples * 2 bytes = 3200 bytes
    this._targetBytes = 3200;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const float32 = input[0];
    const ratio = sampleRate / 16000;
    const outputLength = Math.floor(float32.length / ratio);
    const int16 = new Int16Array(outputLength);

    for (let i = 0; i < outputLength; i++) {
      const srcIndex = Math.floor(i * ratio);
      const sample = Math.max(-1, Math.min(1, float32[srcIndex]));
      int16[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    }

    this._buffer.push(int16);
    this._bufferSize += int16.byteLength;

    if (this._bufferSize >= this._targetBytes) {
      const merged = new Int16Array(this._bufferSize / 2);
      let offset = 0;
      for (const chunk of this._buffer) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }
      this.port.postMessage(merged.buffer, [merged.buffer]);
      this._buffer = [];
      this._bufferSize = 0;
    }

    return true;
  }
}

registerProcessor('pcm-processor', PCMProcessor);
