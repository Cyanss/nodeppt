const { mergeAttrs } = require('../utils');
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
                        class: 'header-wrap',
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
                        class: 'footer-wrap',
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
        slideNode.content = slideNode.content.filter(node => {
            // 遍历 header 和 footer 支持 背景图
            if (node.tag === 'header' || node.tag === 'footer') {

                // slide 使用 youtube、video 以及 fullscreen 属性时 移除 header 和 footer 
                const slideAttrs = slideNode.attrs;

                // console.log('slideAttrs', JSON.stringify(slideAttrs))

                if (slideAttrs.class && slideAttrs.class.indexOf('fullscreen') !== -1) {
                    return false;
                }

                if(slideAttrs.youtube || slideAttrs.video ) {
                    return false;
                }

                // disableheader

                if (node.tag === 'header' && slideAttrs.class && slideAttrs.class.indexOf('disableheader') !== -1) {
                    return false;
                }

                 // disablefooter

                if (node.tag === 'footer' && slideAttrs.class && slideAttrs.class.indexOf('disablefooter') !== -1) {
                    return false;
                }

                const attrs = node.attrs;

                const wrapAttrs = {};

                if (attrs) {

                    for (let i in attrs) {
                        if (i.startsWith(':')) {
                            // 这是 wrap 的样式
                            wrapAttrs[i.slice(1)] = attrs[i];
                        }
                    }
                    if (Object.keys(wrapAttrs).length > 0) {
                        node.content.forEach(innerNode => {
                            if (innerNode && innerNode.attrs && (innerNode.attrs.header || innerNode.attrs.footer)) {
                                innerNode.attrs = mergeAttrs(innerNode.attrs, wrapAttrs);
                            }
                        });
                    }
                }

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
                                        if (c === 'wrapbg') {
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
                            if (innerNode && innerNode.attrs && (innerNode.attrs.header || innerNode.attrs.footer)) {
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
            return true;

        })
    }
};
