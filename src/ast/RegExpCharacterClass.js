const ast = require('.');
const RegExpTree = require('./RegExpTree').default;

class RegExpCharacterClass extends RegExpTree { // https://github.com/v8/v8/blob/master/src/regexp/regexp-ast.h#L289
    constructor(characterSet, isNegated) {
        this.characterSet = characterSet;
        this.isNegated = isNegated;
    }
    accept(visitor, data) {
        visitor.visitCharacterClass(this, data);
    }
    get isStandard() {
        return this.characterSet.isStandard;
    }
    get standardType() {
        return this.characterSet.standardSetType;
    }
    static new0(ranges, isNegated) {
        return new RegExpCharacterClass(
            ast.CharacterSet.new0(ranges),
            isNegated
        );
    }
    static new1(standardSetType) {
        return new RegExpCharacterClass(
            ast.CharacterSet.new1(standardSetType),
            false
        );
    }
}

exports.default = RegExpCharacterClass;
