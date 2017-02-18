const RegExpTree = require('./RegExpTree').default;

class RegExpDisjunction extends RegExpTree { // https://github.com/v8/v8/blob/master/src/regexp/regexp-ast.h#L218
    constructor(alternatives) {
        super();
        this.alternatives = alternatives;
    }
    accept(visitor, data) {
        visitor.visitDisjunction(this, data);
    }
}

exports.default = RegExpDisjunction;
