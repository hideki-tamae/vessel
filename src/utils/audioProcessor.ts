// utils/audioProcessor.ts

/**
 * CIVILIZATION OS - PROOF OF CARE CORE
 * Edge-based Medical Grade Biomarker Extraction Engine
 * VAD (Voice Activity Detection) & Spectral Noise Profiling Enabled
 */

interface AudioSample {
    freq: Uint8Array;
    time: Float32Array;
  }
  
  export const analyzeAudioData = (samples: AudioSample[], sampleRate: number, fftSize: number) => {
    // 1. Noise Profiling & VAD (音声区間検出)
    let noiseEnergy = 0;
    const profileFrames = Math.min(5, samples.length);
    for (let i = 0; i < profileFrames; i++) {
      noiseEnergy += samples[i].time.reduce((sum, v) => sum + v * v, 0) / samples[i].time.length;
    }
    const noiseFloor = noiseEnergy / profileFrames;
    const vadThreshold = Math.max(0.005, noiseFloor * 2.5);

    // 1b. 周波数領域のノイズプロファイル（スペクトラルサブトラクション用）
    // 冒頭の数フレーム（発声前の環境音）を「その場の暗騒音の周波数特性」として記録し、
    // 以降の全フレームからビンごとに差し引く。ブラウザのnoiseSuppression（機器全体向け）に加え、
    // このスキャン固有の環境ノイズに適応する簡易ノイズキャンセリング。
    const binCount = samples[0]?.freq.length ?? 0;
    const noiseProfile = new Float32Array(binCount);
    for (let i = 0; i < profileFrames; i++) {
      const freq = samples[i].freq;
      for (let b = 0; b < binCount; b++) {
        noiseProfile[b] += (freq[b] / 255) ** 2;
      }
    }
    if (profileFrames > 0) {
      for (let b = 0; b < binCount; b++) noiseProfile[b] /= profileFrames;
    }
  
    // 有効な音声フレーム（発声区間）のみを抽出
    const activeFrames = samples.filter(s => {
      const energy = s.time.reduce((sum, v) => sum + v * v, 0) / s.time.length;
      let zcr = 0;
      for (let i = 1; i < s.time.length; i++) {
        if ((s.time[i] >= 0 && s.time[i - 1] < 0) || (s.time[i] < 0 && s.time[i - 1] >= 0)) zcr++;
      }
      const zcrRate = zcr / s.time.length;
      return energy > vadThreshold && zcrRate < 0.3;
    });
  
    const targetFrames = activeFrames.length > 10 ? activeFrames : samples;
  
    // 2. 高精度 F0 (基本周波数) 抽出
    const f0s: number[] = [];
    targetFrames.forEach(s => {
      const t = s.time, n = t.length;
      let bestLag = 0, bestC = -Infinity;
      for (let lag = Math.floor(sampleRate / 500); lag < Math.floor(sampleRate / 60); lag++) {
        let c = 0;
        for (let i = 0; i < n - lag; i++) c += t[i] * t[i + lag];
        if (c > bestC) { bestC = c; bestLag = lag; }
      }
      if (bestLag > 0 && bestC > 0.01) {
        f0s.push(sampleRate / bestLag);
      }
    });
    const f0 = f0s.length > 0 ? f0s.reduce((a, b) => a + b, 0) / f0s.length : 145;
  
    // 3. Jitter (周波数ゆらぎ)
    let jSum = 0, jN = 0;
    for (let i = 1; i < f0s.length; i++) {
      jSum += Math.abs(f0s[i] - f0s[i - 1]) / f0s[i - 1];
      jN++;
    }
    const jitter = jN > 0 ? (jSum / jN) * 100 : 0;
  
    // 4. Shimmer (振幅ゆらぎ)
    const rmsArr = targetFrames.map(s => Math.sqrt(s.time.reduce((sum, v) => sum + v * v, 0) / s.time.length));
    let shimSum = 0, shimN = 0;
    for (let i = 1; i < rmsArr.length; i++) {
      if (rmsArr[i - 1] > 0.0001) {
        shimSum += Math.abs(rmsArr[i] - rmsArr[i - 1]) / rmsArr[i - 1];
        shimN++;
      }
    }
    const shimmer = shimN > 0 ? (shimSum / shimN) * 100 : 0;
  
    // 5. HNR (調波対雑音比)
    // 修正点：
    //  a) ノイズ除去は周波数ビンごとのプロファイル（noiseProfile）を差し引くスペクトラルサブトラクションに変更
    //     （旧実装は時間領域のnoiseFloorを周波数領域の値からそのまま引いており、単位が不一致だった）
    //  b) 調波ビン数（約15本×5=75ビン程度）と非調波ビン数（残り約2000ビン）の数の差により、
    //     単純合計の比だと非調波側が常に大きくなり、静かな環境でもHNRが不当に低く出ていた。
    //     ビン数で正規化した「ビンあたりの平均パワー」の比に変更し、公平な比較にする。
    const freqBin = sampleRate / fftSize;
    const f0Bin = Math.round(f0 / freqBin);

    // 調波ビンの判定テーブルを一度だけ構築（毎フレーム・毎ビンでの配列再生成をやめ、処理も軽くする）
    const isHarmonicBin = new Uint8Array(binCount);
    let harmonicBinCount = 0;
    for (let i = 0; i < binCount; i++) {
      let harmonic = false;
      for (let k = 1; k <= 15; k++) {
        if (Math.abs(i - f0Bin * k) <= 2) { harmonic = true; break; }
      }
      if (harmonic) { isHarmonicBin[i] = 1; harmonicBinCount++; }
    }
    const noiseBinCount = Math.max(0, binCount - harmonicBinCount);

    let hPow = 0, nPow = 0;
    targetFrames.forEach(s => {
      for (let i = 0; i < s.freq.length; i++) {
        const v = Math.max(0, (s.freq[i] / 255) ** 2 - noiseProfile[i]);
        isHarmonicBin[i] ? (hPow += v) : (nPow += v);
      }
    });

    const avgHPow = harmonicBinCount > 0 ? hPow / harmonicBinCount : 0;
    const avgNPow = noiseBinCount > 0 ? nPow / noiseBinCount : 0;
    const EPS = 1e-6; // ゼロ除算・log(0)対策の微小値
    const hnr = avgHPow > 0
      ? Math.min(10 * Math.log10((avgHPow + EPS) / (avgNPow + EPS)), 40)
      : 40; // 有効な調波成分が全く検出できない＝無音に近いとみなし、ノイズ側のペナルティにはしない
  
    // 6. ポリヴェーガル理論に基づく状態変数 ω (Neural State)
    let stateKey: 'ventral' | 'dorsal' | 'sympathetic' | 'mixed';
    if (jitter < 1.0 && shimmer < 3.0 && hnr > 22) {
      stateKey = 'ventral';
    } else if (jitter >= 3.0 || shimmer >= 5.0 || hnr < 12) {
      stateKey = 'dorsal';
    } else if (jitter >= 1.0 && jitter < 3.0 && hnr >= 12 && hnr <= 22) {
      stateKey = 'sympathetic';
    } else {
      stateKey = 'mixed';
    }
  
    return { f0, jitter, shimmer, hnr, stateKey };
  };