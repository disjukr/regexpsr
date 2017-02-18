const kLeadSurrogateStart = 0xd800;
const kMaxCodePoint = 0x10ffff;
const kRangeEndMarker = 0x110000;
const kSpaceRanges = [
    '\t'.charCodeAt(), '\r'.charCodeAt() + 1,
    ' '.charCodeAt(), ' '.charCodeAt() + 1,
    0x00A0, 0x00A1,
    0x1680, 0x1681,
    0x180E, 0x180F,
    0x2000, 0x200B,
    0x2028, 0x202A,
    0x202F, 0x2030,
    0x205F, 0x2060,
    0x3000, 0x3001,
    0xFEFF, 0xFF00,
    kRangeEndMarker
];
const kWordRanges = [
    '0'.charCodeAt(), '9'.charCodeAt() + 1,
    'A'.charCodeAt(), 'Z'.charCodeAt() + 1,
    '_'.charCodeAt(), '_'.charCodeAt() + 1,
    'a'.charCodeAt(), 'z'.charCodeAt() + 1,
    kRangeEndMarker
];
const kDigitRanges = [
    '0'.charCodeAt(), '9'.charCodeAt() + 1,
    kRangeEndMarker
];
const kSurrogateRanges = [
    kLeadSurrogateStart, kLeadSurrogateStart + 1,
    kRangeEndMarker
];
const kLineTerminatorRanges = [
    0x000A, 0x000B,
    0x000D, 0x000E,
    0x2028, 0x202A,
    kRangeEndMarker
];

function addClass(elmv, ranges) {
    const elmc = elmv.length - 1;
    console.assert(elmv[elmc] === kRangeEndMarker);
    for (let i = 0; i < elmc; i += 2) {
        console.assert(elmv[i] < elmv[i + 1]);
        ranges.push(new CharacterRange(elmv[i], elmv[i + 1] - 1));
    }
}

function addClassNegated(elmv, ranges) {
    const elmc = elmv.length - 1;
    console.assert(elmv[elmc] === kRangeEndMarker);
    console.assert(elmv[0] !== 0x0000);
    console.assert(elmv[elmc - 1] !== kMaxCodePoint);
    let last = 0x0000;
    for (let i = 0; i < elmc; i += 2) {
        console.assert(last <= elmv[i] - 1);
        console.assert(elmv[i] < elmv[i + 1]);
        ranges.push(new CharacterRange(last, elmv[i] - 1));
        last = elmv[i + 1];
    }
    ranges.push(new CharacterRange(last, kMaxCodePoint));
}

class CharacterRange { // https://github.com/v8/v8/blob/master/src/regexp/regexp-ast.h#L77
    constructor(from, to) {
        this.from = from;
        this.to = to;
        console.assert(this.isValid);
    }
    get isValid() {
        return 0 <= this.from && this.to <= kMaxCodePoint && this.from <= this.to;
    }
    get isSingleton() {
        return this.from === this.to;
    }
    contains(i) {
        return this.from <= i && i <= this.to;
    }
    isEverything(max) {
        return this.from === 0 && this.to >= max;
    }
    static singleton(value) {
        return new CharacterRange(value, value);
    }
    static isCanonical(characterRanges) {
        console.assert(Array.isArray(characterRanges));
        const n = characterRanges.length;
        if (n <= 1) return true;
        let max = ranges[0].to;
        for (let i = 1; i < n; ++i) {
            const nextRange = characterRanges[i];
            if (nextRange.from <= max + 1) return false;
            max = nextRange.to;
        }
        return true;
    }
    static canonicalize(characterRanges) { // https://github.com/v8/v8/blob/master/src/regexp/jsregexp.cc#L6058
        if (characterRanges.length <= 1) return;
        const n = characterRanges.length;
        let max = characterRanges[0].to;
        let i = 1;
        while (i < n) {
            const current = characterRanges[i];
            if (current.from <= max + 1) {
                break;
            }
            max = current.to;
            ++i;
        }
        if (i === n) return;
        let read = i;
        let numCanonical = i;
        do {
            numCanonical = insertRangeInCanonicalList(characterRanges, numCanonical, characterRanges[read]);
            ++read;
        } while (read < n);
        characterRanges.length = numCanonical;
        console.assert(CharacterRange.isCanonical(characterRanges));
    }
    static negate(ranges) { // https://github.com/v8/v8/blob/master/src/regexp/jsregexp.cc#L6095
        console.assert(CharacterRange.isCanonical(ranges));
        const negatedRanges = [];
        const rangeCount = ranges.length;
        let [from, i] = [0, 0];
        if (rangeCount > 0 && ranges[0].from === 0) {
            from = ranges[0].to + 1;
            i = 1;
        }
        while (i < rangeCount) {
            const range = ranges[i];
            negatedRanges.push(new CharacterRange(from, range.from - 1));
            from = range.to + 1;
            ++i;
        }
        if (from < kMaxCodePoint) {
            negatedRanges.push(new CharacterRange(from, kMaxCodePoint));
        }
        return negatedRanges;
    }
    static addClassEscape(type, ranges) {
        switch(type) {
        case 's':
            addClass(kSpaceRanges, ranges);
            break;
        case 'S':
            addClassNegated(kSpaceRanges, ranges);
            break;
        case 'w':
            addClass(kWordRanges, ranges);
            break;
        case 'W':
            addClassNegated(kWordRanges, ranges);
            break;
        case 'd':
            addClass(kDigitRanges, ranges);
            break;
        case 'D':
            addClassNegated(kDigitRanges, ranges);
            break;
        case '.':
            addClassNegated(kLineTerminatorRanges, ranges);
            break;
        case '*':
            ranges.push(CharacterRange.everything);
            break;
        case 'n':
            addClass(kLineTerminatorRanges, ranges);
            break;
        default:
            throw new Error('unreachable');
        }
    }
}
CharacterRange.everything = new CharacterRange(0, kMaxCodePoint);

function insertRangeInCanonicalList(list, count, insert) { // https://github.com/v8/v8/blob/master/src/regexp/jsregexp.cc#L5992
    const {from, to} = insert;
    let startPos = 0;
    let endPos = count;
    for (let i = count - 1; i >= 0; --i) {
        const current = list[i];
        if (current.from > to + 1) {
            endPos = i;
        } else if (current.to + 1 < from) {
            startPos = i + 1;
            break;
        }
    }
    if (startPos === endPos) {
        if (startPos < count) {
            moveRanges(list, startPos, startPos + 1, count - startPos);
        }
        list[startPos] = insert;
        return count + 1;
    }
    if (startPos + 1 == endPos) {
        const toReplace = list[startPos];
        const newFrom = Math.min(toReplace.from, from);
        const newTo = Math.max(toReplace.to, to);
        list[startPos] = new CharacterRange(newFrom, newTo);
        return count;
    }
    const newFrom = Math.min(list[startPos].from, from);
    const newTo = Math.max(list[endPos - 1].to, to);
    if (endPos < count) {
        moveRanges(list, endPos, startPos + 1, count - endPos);
    }
    list[startPos] = new CharacterRange(newFrom, newTo);
    return count - (endPos - startPos) + 1;
}

function moveRanges(list, from, to, count) { // https://github.com/v8/v8/blob/master/src/regexp/jsregexp.cc#L5975
    if (from < to) {
        for (let i = count - 1; i >= 0; --i) {
            list[to + i] = list[from + i];
        }
    } else {
        for (let i = 0; i < count; ++i) {
            list[to + i] = list[from + i];
        }
    }
}

exports.default = CharacterRange;
