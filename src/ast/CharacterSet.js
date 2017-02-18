const ast = require('.');

class CharacterSet { // https://github.com/v8/v8/blob/master/src/regexp/regexp-ast.h#L136
    constructor(ranges = [], standardSetType = '\0') {
        this.ranges = ranges;
        this.standardSetType = standardSetType;
    }
    get isStandard() {
        return this.standardSetType !== '\0';
    }
    canonicalize() {
        if (!this.ranges) return;
        ast.CharacterRange.canonicalize(this.ranges);
    }
    static new0(ranges = []) {
        return new CharacterSet(ranges);
    }
    static new1(standardSetType) {
        return new CharacterSet(null, standardSetType);
    }
}

exports.default = CharacterSet;
