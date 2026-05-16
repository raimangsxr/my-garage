import { describe, expect, it } from 'vitest';

import {
  extractQueryAfterWakePhrase,
  inferSpeechLocale,
  mergeRecognitionTranscript,
  mergeVoiceTranscript,
  normalizeTranscript,
  pickBestVoice,
  stripWakePhraseOccurrences,
} from './vehicle-docs-ai-voice.util';

describe('vehicle docs ai voice utils', () => {
  it('extracts the query after the wake phrase', () => {
    expect(extractQueryAfterWakePhrase('Hey Garage what oil should I use?', 'Hey Garage')).toEqual({
      detected: true,
      queryText: 'what oil should I use?',
    });
  });

  it('accepts punctuation between wake phrase words', () => {
    expect(extractQueryAfterWakePhrase('Hey, Garage, show torque specs', 'Hey Garage')).toEqual({
      detected: true,
      queryText: 'show torque specs',
    });
  });

  it('returns no match when wake phrase is absent', () => {
    expect(extractQueryAfterWakePhrase('Show torque specs for the wheels', 'Hey Garage')).toEqual({
      detected: false,
      queryText: '',
    });
  });

  it('removes repeated wake phrases from the remaining query', () => {
    expect(
      extractQueryAfterWakePhrase('Hey Garage check oil hey garage front brakes', 'Hey Garage'),
    ).toEqual({
      detected: true,
      queryText: 'check oil front brakes',
    });
  });

  it('merges a new transcript without overwriting existing text', () => {
    expect(mergeVoiceTranscript('Need oil type', 'and brake fluid capacity')).toEqual({
      text: 'Need oil type and brake fluid capacity',
      appended: true,
    });
  });

  it('strips wake phrase occurrences from arbitrary transcript chunks', () => {
    expect(
      stripWakePhraseOccurrences('Hey Garage show torque specs, hey garage', 'Hey Garage'),
    ).toBe('show torque specs');
  });

  it('deduplicates recognition results when the browser repeats the full utterance', () => {
    expect(mergeRecognitionTranscript('show torque specs', 'show torque specs')).toBe(
      'show torque specs',
    );
  });

  it('extends recognition results when a later chunk contains the previous text plus more', () => {
    expect(mergeRecognitionTranscript('show torque', 'show torque specs for wheels')).toBe(
      'show torque specs for wheels',
    );
  });

  it('merges overlapping recognition chunks without repeating the overlap', () => {
    expect(mergeRecognitionTranscript('show torque specs', 'specs for front wheels')).toBe(
      'show torque specs for front wheels',
    );
  });

  it('normalizes repeated whitespace', () => {
    expect(normalizeTranscript('  Ask   about   front brakes  ')).toBe('Ask about front brakes');
  });

  it('infers spanish locale from spanish response text', () => {
    expect(
      inferSpeechLocale('La respuesta recomienda cambiar el aceite y revisar los frenos.'),
    ).toBe('es-ES');
  });

  it('infers english locale from english response text', () => {
    expect(inferSpeechLocale('The answer recommends checking the oil and front brakes.')).toBe(
      'en-US',
    );
  });

  it('picks the closest available voice for the preferred locale', () => {
    const voices = [
      { lang: 'en-US', default: false } as SpeechSynthesisVoice,
      { lang: 'es-ES', default: false } as SpeechSynthesisVoice,
    ];
    expect(pickBestVoice(voices, 'es-ES')?.lang).toBe('es-ES');
  });
});
