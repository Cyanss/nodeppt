const utils = require('./utils');
const {getAttrs, getAttrsString} = require('../markdown/attrs/utils');

module.exports = tree => {
    let { slideNode, wrapNode } = utils(tree);

    if (wrapNode.content && wrapNode.content.length) {
        // console.log(wrapNode.content)

        wrapNode.content = wrapNode.content.map(node => {
            if (node.tag === 'footer' || node.tag === 'header') {

                node.content = [{
                    tag: 'div',
                    attrs: {
                        class: 'wrap'
                    },
                    content: node.content
                }];

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
                                        return `background-${c}`;
                                    }

                                    return c;
                                });
                            } else {
                                rs[key] = value;
                            }
                        });
                    }

                    node.content.unshift({
                        tag: 'span',
                        attrs: {
                            ...rs,
                            class: [noBackgroundClass ? '' : 'background', ...cls].join(' '),
                            style: `background-image:url('${image}')`
                        }
                    });
                }


                if (node.tag === 'header') {
                    slideNode.content.unshift(node);
                } else {
                    slideNode.content.push(node);
                }
                return false;
            }
            return node;
        });
    }
};
