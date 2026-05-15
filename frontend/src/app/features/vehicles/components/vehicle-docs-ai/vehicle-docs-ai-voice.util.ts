export interface WakePhraseMatch {
    detected: boolean;
    queryText: string;
}

export interface MergedTranscriptResult {
    text: string;
    appended: boolean;
}

const LANGUAGE_HINTS: Array<{ locale: string; patterns: RegExp[] }> = [
    {
        locale: 'es-ES',
        patterns: [/\b(el|la|los|las|para|con|sin|aceite|mantenimiento|vehiculo|coche|frenos|respuesta)\b/i, /[áéíóúñ¿¡]/i]
    },
    {
        locale: 'fr-FR',
        patterns: [/\b(le|la|les|pour|avec|sans|huile|entretien|freins)\b/i, /[àâçéèêëîïôùûüÿ]/i]
    },
    {
        locale: 'it-IT',
        patterns: [/\b(il|lo|la|gli|per|con|senza|olio|manutenzione|freni)\b/i, /[àèéìíîòóùú]/i]
    },
    {
        locale: 'pt-PT',
        patterns: [/\b(o|a|os|as|para|com|sem|óleo|manutenção|travões|freios)\b/i, /[ãõâêôç]/i]
    },
    {
        locale: 'de-DE',
        patterns: [/\b(der|die|das|mit|ohne|öl|wartung|bremsen)\b/i, /[äöüß]/i]
    },
    {
        locale: 'en-US',
        patterns: [/\b(the|for|with|without|oil|maintenance|brakes|vehicle|answer)\b/i]
    }
];

export function extractQueryAfterWakePhrase(rawText: string, wakePhrase: string): WakePhraseMatch {
    const transcript = normalizeTranscript(rawText);
    const escapedWakePhrase = escapeForRegex(wakePhrase.trim());
    const wakePhrasePattern = escapedWakePhrase
        .split(/\s+/)
        .filter((part) => part.length > 0)
        .join('[\\s,.:;!?-]*');
    const wakePhraseRegex = new RegExp(`\\b${wakePhrasePattern}\\b`, 'i');
    const match = transcript.match(wakePhraseRegex);

    if (!match || match.index === undefined) {
        return { detected: false, queryText: '' };
    }

    return {
        detected: true,
        queryText: normalizeTranscript(
            transcript
                .slice(match.index + match[0].length)
                .replace(/^[\s,.:;!?-]+/, '')
        )
    };
}

export function mergeVoiceTranscript(existingText: string, transcript: string): MergedTranscriptResult {
    const currentText = normalizeTranscript(existingText);
    const nextTranscript = normalizeTranscript(transcript);

    if (!nextTranscript) {
        return {
            text: currentText,
            appended: false
        };
    }

    if (!currentText) {
        return {
            text: nextTranscript,
            appended: false
        };
    }

    if (currentText === nextTranscript) {
        return {
            text: currentText,
            appended: false
        };
    }

    return {
        text: `${currentText} ${nextTranscript}`,
        appended: true
    };
}

export function normalizeTranscript(value: string): string {
    return value
        .replace(/\s+/g, ' ')
        .trim();
}

export function inferSpeechLocale(text: string, fallbackLocale = 'en-US'): string {
    const normalizedText = normalizeTranscript(text);
    if (!normalizedText) {
        return fallbackLocale;
    }

    let bestMatch = fallbackLocale;
    let bestScore = 0;

    for (const languageHint of LANGUAGE_HINTS) {
        const score = languageHint.patterns.reduce((total, pattern) => total + (pattern.test(normalizedText) ? 1 : 0), 0);
        if (score > bestScore) {
            bestScore = score;
            bestMatch = languageHint.locale;
        }
    }

    return bestMatch;
}

export function pickBestVoice(
    voices: ReadonlyArray<SpeechSynthesisVoice>,
    preferredLocale: string
): SpeechSynthesisVoice | null {
    if (!voices.length) {
        return null;
    }

    const normalizedPreferredLocale = preferredLocale.toLowerCase();
    const preferredLanguage = normalizedPreferredLocale.split('-')[0];

    return voices.find((voice) => voice.lang.toLowerCase() === normalizedPreferredLocale)
        || voices.find((voice) => voice.lang.toLowerCase().startsWith(`${preferredLanguage}-`))
        || voices.find((voice) => voice.default)
        || voices[0]
        || null;
}

function escapeForRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
