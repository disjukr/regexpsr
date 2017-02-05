class RegExpTree { // https://github.com/v8/v8/blob/master/src/regexp/regexp-ast.h#L193
    get isTextElement() { return false; }
    get isAnchoredAtStart() { return false; }
    get isAnchoredAtEnd() { return false; }
    get minMatch() {}
    get maxMatch() {}
    accept(visitor, data) {}
    appendToText(text) { throw new Error('unreachable'); }
}
RegExpTree.kInfinity = 0x7FFFFFFF;

exports.default = RegExpTree;
