const utils = require('./utils');
const { getAttrs, getAttrsString } = require('../markdown/attrs/utils');

module.exports = tree => {
    let { slideNode, wrapNode } = utils(tree);


    if (wrapNode.content && wrapNode.content.length) {
        // console.log(wrapNode.content)
        // 遍历wrap中的节点分别处理 内部header和footer
        wrapNode.content = wrapNode.content.map(node => {

            //先处理header
            if (node.tag === 'header') {
                // 监测到wrap中有header 对全局的 header进行删除覆盖
                slideNode.content = slideNode.content.filter(slideContentNode => slideContentNode.tag !== 'header');

                node.content = [{
                    tag: 'div',
                    attrs: {
                        class: 'wrap',
                        header: 'true'
                    },
                    content: node.content
                }];

                // 添加当前节点 到 wrap上方
                slideNode.content.unshift(node);

                return false;

            } else if (node.tag === 'footer') {

                // 监测到wrap中有footer 对全局的 footer进行删除覆盖
                slideNode.content = slideNode.content.filter(slideContentNode => slideContentNode.tag !== 'footer');

                node.content = [{
                    tag: 'div',
                    attrs: {
                        class: 'wrap',
                        footer: 'true'
                    },
                    content: node.content
                }];

                // 添加当前节点 到 wrap下方
                slideNode.content.push(node);

                return false;
            } else {
                return node;
            }
        });
    }

    if (slideNode.content && slideNode.content.length) {
        slideNode.content.forEach(node => {
            // 遍历 header 和 footer 支持 背景图
            if (node.tag === 'header' || node.tag === 'footer') {

                const attrs = node.attrs;

                if (attrs && attrs.image) {
                    let [image, ...imgAttrs] = attrs.image.split(/\s+/);
                    imgAttrs = getAttrs(`{${imgAttrs.join(' ')}}`, 0, {
                        leftDelimiter: '{',
                        rightDelimiter: '}'
                    });
                    const rs = {};
                    let cls = [];
                    let noBackgroundClass = false;

                    let useWrapBackground = false;

                    if (imgAttrs.length) {
                        imgAttrs.forEach(([key, value]) => {
                            if (key === 'class') {
                                cls = value.split('.').map(c => {
                                    if (!['dark', 'light', 'anim'].includes(c)) {
                                        if (
                                            [
                                                'top',
                                                'bottom',
                                                'right',
                                                'right-top',
                                                'right-bottom',
                                                'center',
                                                'center-top',
                                                'center-bottom',
                                                'left',
                                                'left-top',
                                                'left-bottom'
                                            ].includes(c)
                                        ) {
                                            noBackgroundClass = true;
                                        }
                                        if (c === 'wrap-bg') {
                                            useWrapBackground = true;
                                            return '';
                                        }
                                        return `background-${c}`;
                                    }

                                    return c;
                                });
                            } else {
                                rs[key] = value;
                            }
                        });
                    }

                    if (useWrapBackground) {
                        node.content.forEach(innerNode => {
                            if (innerNode.attrs && (innerNode.attrs.header || innerNode.attrs.footer)) {
                                innerNode.content.unshift({
                                    tag: 'span',
                                    attrs: {
                                        ...rs,
                                        class: [noBackgroundClass ? '' : 'background', ...cls].join(' '),
                                        style: `background-image:url('${image}')`
                                    }
                                });
                            }
                            return node;
                        });

                    } else {
                        node.content.unshift({
                            tag: 'span',
                            attrs: {
                                ...rs,
                                class: [noBackgroundClass ? '' : 'background', ...cls].join(' '),
                                style: `background-image:url('${image}')`
                            }
                        });
                    }

                }
            }

        })
    }
};
