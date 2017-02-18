const RegExpTree = require('./RegExpTree').default;

class RegExpAlternative extends RegExpTree { // https://github.com/v8/v8/blob/master/src/regexp/regexp-ast.h#L242
    constructor(nodes) {
        super();
        this.nodes = nodes;
    }
    accept(visitor, data) {
        visitor.visitAlternative(this, data);
    }
}

exports.default = RegExpAlternative;
