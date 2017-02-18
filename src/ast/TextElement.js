class TextElement { // https://github.com/v8/v8/blob/master/src/regexp/regexp-ast.h#L158
    constructor(textType, tree) {
        this.cpOffset = -1;
        this.textType = textType;
        this.tree = tree;
    }
    get atom() {
        console.assert(this.textType === TextType.ATOM);
        return this.tree;
    }
    get charClass() {
        console.assert(this.textType === TextType.CHAR_CLASS);
        return this.tree;
    }
    static atom(atom) {
        return new TextElement(TextType.ATOM, atom);
    }
    static charClass(charClass) {
        return new TextElement(TextType.CHAR_CLASS, charClass);
    }
}

const TextType = {
    ATOM: 'ATOM',
    CHAR_CLASS: 'CHAR_CLASS',
};

exports.default = TextElement;
exports.TextType = TextType;
