const name = 'cts';
module.exports = {
    validate(params) {
        return params.trim().match(new RegExp('^' + name + '\\s*(.*)$'));
    },
    handler(state, opts) {
        function getOpenToken(tag, level) {
            const token = new state.Token('container_' + name + '_' + tag + '_open', tag, 1);
            token.block = true;
            token.level = 1 + level;
            return token;
        }

        function getCloseToken(tag, level) {
            const token = new state.Token('container_' + name + '_' + tag + '_close', tag, -1);
            token.block = true;
            token.level = 1 + level;
            return token;
        }
        // tokens
        const tokens = state.tokens;

        let open = false;
        let done = 0;
        let count = 1;
        let level = 1;
        let leftStart = 0,
            leftEnd = 0;
        let subjectStart = 0,
            subjectEnd = 0;
        let rightStart = 0,
            rightEnd = 0;

        let lefts = [],
            subjects = [],
            rights = [];

        for (let i = 0; i < tokens.length; i++) {
            let token = tokens[i];
            if (token.type === 'container_' + name + '_open' && !token.meta.handle) {
                token.meta.handle = true;
                // 在 open 后面插入
                open = true;
                level = token.level + 1;
            } else if (token.type === 'container_' + name + '_close' && !token.meta.handle) {
                token.meta.handle = true;
                // 在 close 之前插入
                open = false;
            } else if (open && 'hr' === token.type && done === 0) {
                tokens.splice(i, 1);
                i--;
                count++;
            } else if (open) {
                // 加深一层，因为外面多套了一层div
                // token.level = token.level + 2;
                // 保证hr 是最贴近 container 的一层
                if (/_open$/.test(token.type)) {
                    done++;
                } else if (/_close$/.test(token.type)) {
                    done--;
                }
                if (count === 1) {
                    if (!leftStart) {
                        leftStart = i;
                    } else {
                        leftEnd = i;
                    }
                    lefts.push(token);
                } else if (count === 2) {
                    if (!subjectStart) {
                        subjectStart = i;
                    } else {
                        subjectEnd = i;
                    }
                    token.level = token.level + 1;
                    subjects.push(token);
                } else if (count === 3) {
                    if (!rightStart) {
                        rightStart = i;
                    } else {
                        rightEnd = i;
                    }
                    token.level = token.level + 1;
                    rights.push(token);
                }
            }
        }

        // 分组完成
        const leftToken = getOpenToken('div', level - 1);
        leftToken.attrPush(['class', 'subject-left']);
        tokens.splice(leftStart, leftEnd - leftStart + 1, leftToken, ...lefts, getCloseToken('div', level - 1));

        const subjectToken = getOpenToken('div', level - 1);
        subjectToken.attrPush(['class', 'subject']);
        tokens.splice(subjectStart + 2, subjects.length, subjectToken, ...subjects, getCloseToken('div', level - 1));

        const rightToken = getOpenToken('div', level - 1);
        rightToken.attrPush(['class', 'subject-right']);
        tokens.splice(rightStart + 4, rights.length, rightToken, ...rights, getCloseToken('div', level - 1));


        return state;
    },
    render(tokens, idx) {
        const token = tokens[idx];
        if (token.nesting === 1) {
            const cmIndex = token.attrIndex('css-module');
            let clsIndex = token.attrIndex('class');
            let attrs = token.attrs || [];

            if (clsIndex >= 0) {
                attrs[clsIndex][1] += cmIndex >= 0 ? ` cts ${attrs[cmIndex][1]}` : ` cts`;
            } else {
                attrs.push(['class', cmIndex >= 0 ? ` cts ${attrs[cmIndex][1]}` : ` cts`]);
            }

            attrs = attrs.map(([key, value]) => {
                return `${key}="${value}"`;
            });
            // opening tag
            return `<div ${attrs.join(' ')}>\n`;
        } else {
            // closing tag
            return '</div>\n';
        }
    }
};
