class TextElement { // https://github.com/v8/v8/blob/master/src/regexp/regexp-ast.h#L158
    constructor(textType, tree) {
        this.cpOffset = -1;
        this.textType = textType;
        this.tree = tree;
    }
    get atom() {
        console.assert(this.textType === TextElement.TextType.ATOM);
        return this.tree;
    }
    get charClass() {
        console.assert(this.textType === TextElement.TextType.CHAR_CLASS);
        return this.tree;
    }
    static atom(atom) {
        return new TextElement(TextElement.TextType.ATOM, atom);
    }
    static charClass(charClass) {
        return new TextElement(TextElement.TextType.CHAR_CLASS, charClass);
    }
}
TextElement.TextType = {
    ATOM: 'ATOM',
    CHAR_CLASS: 'CHAR_CLASS',
};

exports.default = TextElement;
