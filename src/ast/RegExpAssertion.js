const RegExpTree = require('./RegExpTree').default;

class RegExpAssertion extends RegExpTree { // https://github.com/v8/v8/blob/master/src/regexp/regexp-ast.h#L263
    constructor(assertionType) {
        super();
        this.assertionType = assertionType;
    }
    accept(visitor, data) {
        visitor.visitAssertion(this, data);
    }
}

const AssertionType = {
    START_OF_LINE: 'START_OF_LINE',
    START_OF_INPUT: 'START_OF_INPUT',
    END_OF_LINE: 'END_OF_LINE',
    END_OF_INPUT: 'END_OF_INPUT',
    BOUNDARY: 'BOUNDARY',
    NON_BOUNDARY: 'NON_BOUNDARY',
};

exports.default = RegExpAssertion;
exports.AssertionType = AssertionType;
