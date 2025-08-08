class KMP {
    static LPS(pattern){
        const lps = new Array(pattern.length).fill(0);
        let j = 0; 
        let i = 1;

        while (i < pattern.length) {
            if (pattern[i] === pattern[j]) {
                j++;
                lps[i] = j;
                i++;
            } else {
                if (j !== 0) {
                    j = lps[j - 1];
                } else {
                    lps[i] = 0;
                    i++;
                }
            }
        }
        return lps;
    }

    static search(text, pattern) {
        const lps = this.LPS(pattern);
        const result = [];
        let i = 0; 
        let j = 0;

        while (i < text.length) {
            if (text[i] === pattern[j]) {
                i++;
                j++;
            }

            if (j === pattern.length) {
                result.push(i - j);
                j = lps[j - 1];
            } else if (i < text.length && text[i] !== pattern[j]) {
                if (j !== 0) {
                    j = lps[j - 1];
                } else {
                    i++;
                }
            }
        }
        return result; 
    }
}

class BoyerMoore {
    /**
     * Creates the bad-character table. 
     * The table stores the last seen index of each character in the pattern.
     * @param {string} pattern The pattern to search for.
     * @returns {object} A map of character to its last index.
     */
    static badCharTable(pattern) {
        const table = {};
        // Store the last index of each character in the pattern
        for (let i = 0; i < pattern.length; i++) {
            table[pattern[i]] = i;
        }
        return table;
    }

    /**
     * Searches for a pattern in a text using the Boyer-Moore algorithm.
     * @param {string} text The text to search in.
     * @param {string} pattern The pattern to search for.
     * @returns {number[]} An array of starting indices of all occurrences.
     */
    static search(text, pattern) {
        if (pattern.length === 0) return [];

        const badChar = this.badCharTable(pattern);
        const result = [];
        let s = 0; // s is the shift of the pattern with respect to the text

        while (s <= text.length - pattern.length) {
            let j = pattern.length - 1;

            // Keep reducing j while characters of pattern and text are matching
            // at this shift s
            while (j >= 0 && pattern[j] === text[s + j]) {
                j--;
            }

            // If the pattern has been fully matched (j < 0)
            if (j < 0) {
                result.push(s);
                // A match was found. Shift the pattern to align the character
                // after the match in the text with its last occurrence in the pattern.
                // This is a simple version of the Good Suffix rule.
                // If the character isn't in the pattern, we can shift by the full pattern length.
                const charAfterMatch = text[s + pattern.length];
                const shift = pattern.length - (badChar[charAfterMatch] || -1);
                s += s + pattern.length < text.length ? shift : 1;

            } else {
                // Mismatch occurred. Shift the pattern so that the bad character
                // in the text aligns with its last occurrence in the pattern.
                const badCharInText = text[s + j];
                const lastOccurrence = badChar[badCharInText];
                
                // The shift is the mismatch index minus the last occurrence index.
                // We use Math.max(1, ...) to ensure we always move forward.
                const shift = j - (lastOccurrence !== undefined ? lastOccurrence : -1);
                s += Math.max(1, shift);
            }
        }
        return result;
    }
}

class RabinKarp {
    static rollingHash(str, base, mod) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = (hash * base + str.charCodeAt(i)) % mod;
        }
        return hash;
    }

    static updateHash(oldHash, oldChar, newChar, powerTerm, base, mod) {
        const oldVal = oldChar.charCodeAt(0);
        const newVal = newChar.charCodeAt(0);

        let newHash = (oldHash - (oldVal * powerTerm) % mod + mod) % mod;
        
        newHash = (newHash * base + newVal) % mod;
        
        return newHash;
    }

    static search(text, pattern) {
        const base = 256; 
        const mod = 101; 

        if (pattern.length > text.length) return [];

        const patternHash = this.rollingHash(pattern, base, mod);
        let currentHash = this.rollingHash(text.slice(0, pattern.length), base, mod);
        const result = [];
        let powerTerm = 1;

        for (let i = 0; i < pattern.length - 1; i++) {
            powerTerm = (powerTerm * base) % mod;
        }

        for (let i = 0; i <= text.length - pattern.length; i++) {
            if (currentHash === patternHash) {
                for (let j = 0; j < pattern.length; j++) {
                    if (text[i + j] !== pattern[j]) {
                        break;
                    }
                    if (j === pattern.length - 1) {
                        result.push(i);
                    }
                }
            }

            if (i < text.length - pattern.length) {
                currentHash = this.updateHash(currentHash, text[i], text[i + pattern.length], powerTerm, base, mod);
            }
        }
        return result;
    }
}

class Regex {
    static pattern = "\\b[a-zA-Z]+\\d{2,3}\\b";

    static search(text) {
        const regex = new RegExp(this.pattern, 'g');
        const matches = [];
        let match;

        while ((match = regex.exec(text)) !== null) {
            matches.push(match[0]);
        }
        return matches;
    }
}

module.exports = { KMP, BoyerMoore, RabinKarp, Regex };

// test
// let text = "awesome bro plz make project based js videos for beginners thanks bro88";
// let pattern = "thanks";
// let result = []
// if (KMP.search(text, pattern).length > 0) {
//     result.push(...KMP.search(text, pattern));
// }
// if (BoyerMoore.search(text, pattern).length > 0) {
//     result.push(...BoyerMoore.search(text, pattern));
// }
// if (RabinKarp.search(text, pattern).length > 0) {
//     result.push(...RabinKarp.search(text, pattern));
// }
// if (Regex.search(text).length > 0) {
//     result.push(...Regex.search(text));
// }
// console.log(result);
