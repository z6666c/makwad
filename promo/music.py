"""Synthesize a short, calm-tech soundtrack (pad + pulse + transition whooshes). Original, royalty-free."""
import sys, wave
import numpy as np

path, dur = sys.argv[1], float(sys.argv[2])
sr = 44100
t = np.arange(int(sr * dur)) / sr
bpm = 112; beat = 60 / bpm
mix = np.zeros_like(t)

def note(f): return 440 * 2 ** ((f - 69) / 12)
# chord progression (midi), one chord per 2 bars
chords = [[57, 60, 64, 69], [53, 57, 60, 65], [48, 52, 55, 60], [55, 59, 62, 67]]
bar = beat * 4
for ci in range(int(dur / (bar * 2)) + 1):
    ch = chords[ci % 4]; st = ci * bar * 2; en = st + bar * 2
    m = (t >= st) & (t < en + .6)
    tt = t[m] - st
    env = np.minimum(1, tt / .4) * np.exp(-np.maximum(0, tt - bar * 2) / .25)
    for k, n in enumerate(ch):
        f = note(n)
        mix[m] += .05 * env * (np.sin(2 * np.pi * f * tt) + .3 * np.sin(2 * np.pi * 2 * f * tt + k) + .15 * np.sin(2 * np.pi * f * 1.003 * tt))
# arpeggio pluck on 8ths
arp = [69, 72, 76, 72, 81, 76, 72, 76]
step = beat / 2
for i in range(int(dur / step)):
    st = i * step
    if st < 0.4: continue
    ch = chords[int(st / (bar * 2)) % 4]
    n = ch[(i % 4)] + 12
    m = (t >= st) & (t < st + .35)
    tt = t[m] - st
    mix[m] += .045 * np.exp(-tt * 9) * np.sin(2 * np.pi * note(n) * tt)
# soft kick on beats, starting after logo
for i in range(int(dur / beat)):
    st = i * beat
    if st < 2.4 or st > dur - 1.2: continue
    m = (t >= st) & (t < st + .3)
    tt = t[m] - st
    f = 50 + 90 * np.exp(-tt * 30)
    mix[m] += .32 * np.exp(-tt * 12) * np.sin(2 * np.pi * np.cumsum(f) / sr)
# hats on off-beats
rng = np.random.default_rng(7)
for i in range(int(dur / beat)):
    st = i * beat + beat / 2
    if st < 2.4 or st > dur - 1.2: continue
    m = (t >= st) & (t < st + .06)
    tt = t[m] - st
    mix[m] += .05 * np.exp(-tt * 60) * rng.standard_normal(m.sum())
# whooshes at scene changes
for c in [2.45, 5.45, 10.25, 12.7]:
    m = (t >= c - .5) & (t < c + .3)
    tt = t[m] - (c - .5)
    env = np.sin(np.pi * np.clip(tt / .8, 0, 1)) ** 2
    noise = rng.standard_normal(m.sum())
    noise = np.convolve(noise, np.ones(18) / 18, mode='same')
    mix[m] += .22 * env * noise
# logo hit
for c in [0.35, 12.95]:
    m = (t >= c) & (t < c + 2.2)
    tt = t[m] - c
    mix[m] += .12 * np.exp(-tt * 1.8) * (np.sin(2 * np.pi * note(45) * tt) + .5 * np.sin(2 * np.pi * note(57) * tt) + .25 * np.sin(2 * np.pi * note(64) * tt))
# master fade
mix *= np.minimum(1, t / .3) * np.minimum(1, (dur - t) / .8)
mix = np.tanh(mix * 1.4) * .8
st = np.stack([mix, np.roll(mix, 300) * .95], axis=1)
w = wave.open(path, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr)
w.writeframes((st * 32767).astype('<i2').tobytes()); w.close()
