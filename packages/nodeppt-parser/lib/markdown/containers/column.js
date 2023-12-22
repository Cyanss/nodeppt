const name = 'column';

module.exports = {
    validate(params) {
        return params.trim().match(/^column\s*(.*)$/);
    },
    handler(state, opts) {
        function getOpenToken(level) {
            const token = new state.Token('container_' + name + '_item_open', 'div', 1);
            token.block = true;
            token.level = 1 + level;
            token.attrs = [
                ['class', name]
            ];
            return token;
        }

        function getCloseToken(level) {
            const token = new state.Token('container_' + name + '_item_close', 'div', -1);
            token.block = true;
            token.level = 1 + level;
            return token;
        }
        // tokens
        const tokens = state.tokens;

        let open = false;
        let done = 0;
        let wrapToken = null;
        // 记录新增加的OpenToken下标
        let newOpenIndex = 0;

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            console.log('\n', i)
            if (token.type === 'container_' + name + '_open' && !token.meta.handle) {
                // 解决多级嵌套问题
                if (wrapToken) {
                    // 移除之前添加的 OpenToken 删除后，所有元素的下标前移  
                    tokens.splice(newOpenIndex, 1);
                    // 重置 处理进度标记
                    wrapToken.meta.handle = false;
                    // 标记处理进度 解决同时使用2个或2个以上同一个组件的多次插入问题。
                    token.meta.handle = true;
                    // 在 open 后面插入
                    tokens.splice(i, 0, getOpenToken(token.level));
                    // 游标移动
                    wrapToken = token;
                    // 下标前移了
                    newOpenIndex = i;
                    open = true;
                } else {
                    // 标记处理进度 解决同时使用2个或2个以上同一个组件的多次插入问题。
                    token.meta.handle = true;
                    // 在 open 后面插入
                    tokens.splice(i + 1, 0, getOpenToken(token.level));
                    // 游标移动
                    wrapToken = token;
                    // 记录新增加的OpenToken下标
                    newOpenIndex = i + 1;
                    open = true;
                    // 跳过新增的OpenToken
                    i++;
                }

            } else if (token.type === 'container_' + name + '_close' && !token.meta.handle) {
                token.meta.handle = true;
                // 在 close 之前插入
                tokens.splice(i, 0, getCloseToken(token.level));
                open = false;
                i++;
            } else if (open && 'hr' === token.type && done === 0) {
                // 第一层的 Hr 需要替换
                tokens.splice(i, 1, getCloseToken(token.level - 1), getOpenToken(token.level - 1));
                i++;
            } else if (open) {
                // 加深一层，因为外面多套了一层div
                token.level = token.level + 1;
                // 保证hr 是最贴近 container 的一层
                if (/_open$/.test(token.type)) {
                    done++;
                } else if (/_close$/.test(token.type)) {
                    done--;
                }
            }
        }
        return state;
    },
    render(tokens, idx) {
        const token = tokens[idx];

        if (token.nesting === 1) {
            const cmIndex = token.attrIndex('css-module');
            let clsIndex = token.attrIndex('class');
            let attrs = token.attrs || [];

            if (clsIndex >= 0) {
                attrs[clsIndex][1] += cmIndex >= 0 ? ` grid ${attrs[cmIndex][1]}` : ' grid';
            } else {
                attrs.push(['class', cmIndex >= 0 ? `grid ${attrs[cmIndex][1]}` : 'grid']);
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
