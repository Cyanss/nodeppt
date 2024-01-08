const posthtml = require('posthtml');
const getMdParser = require('./get-markdown-parser');
// 内置 posthtml 插件
const buildInPlugins = [
    './tags/slide.js',
    './tags/note.js',
    './tags/header-footer.js',
    // attrs放到最后
    './tags/attrs.js',
];
const buildInPosthtmlPlugins = buildInPlugins.map((file) => {
    return require(file);
});

module.exports = (plugins) => {
    const markdownPlugins = [];
    const posthtmlPlugins = [];

    plugins.forEach((p) => {
        if (p && typeof p.apply === 'function') {
            if (p.id.indexOf('markdown') === 0) {
                markdownPlugins.push(p.apply);
            } else if (p.id.indexOf('posthtml') === 0) {
                posthtmlPlugins.push(p.apply);
            }
        }
    });
    const mdRender = getMdParser(markdownPlugins);

    return (str) => {

        // 全局 header 
        const headerTags = str.match(/\n<header\s*(.*)>/gim) || [];
        const headerContents = str.split(/\n<header.*>/im);
        headerContents.shift();
        let headerHtml = '';
        if (headerTags.length > 0 && headerContents.length > 0) {
            let headerTag = headerTags[0];
            let headerContent = headerContents[0].split(/\n<subject.*>|<footer.*>|<slide.*>/im)[0];
            let headerAttr = mdRender(headerContent);
            headerHtml = `
${headerTag}
<div class="header-wrap" header="true">
${headerAttr}
</div>
</header>
      `;

        }
        // console.log('headerHtml', headerHtml)

        // 全局 subject 
        const subjectTags = str.match(/\n<subject\s*(.*)>/gim) || [];
        const subjectContents = str.split(/\n<subject.*>/im);
        subjectContents.shift();
        let subjectHtml = '';
        if (subjectTags.length > 0 && subjectContents.length > 0) {
            let subjectTag = subjectTags[0];
            let subjectContent = subjectContents[0].split(/\n<header.*>|<footer.*>|<slide.*>/im)[0];
            let subjectAttr = mdRender(subjectContent);
            subjectHtml = `
${subjectTag}
<div class="subject-wrap" subject="true">
${subjectAttr}
</div>
</subject>
      `;

        }
        // console.log('subjectHtml', subjectHtml)


        // 全局 footer 
        const footerTags = str.match(/\n<footer\s*(.*)>/gim) || [];
        const footerContents = str.split(/\n<footer.*>/im);
        footerContents.shift();

        let footerHtml = '';
        if (footerTags.length > 0 && footerContents.length > 0) {
            let footerTag = footerTags[0];
            let footerContent = footerContents[0].split(/\n<header.*>|<subject.*>|<slide.*>/im)[0];
            let footerAttr = mdRender(footerContent);
            footerHtml = `
${footerTag}
<div class="footer-wrap" footer="true">
${footerAttr}
</div>
</footer>
      `;

        }
        // console.log('footerHtml', footerHtml)

        const slideTag = str.match(/\n<slide\s*(.*)>/gim) || [];
        const contents = str.split(/\n<slide.*>/im);
        contents.shift();
        return contents
            .map((c, i) => {
                var attr = mdRender(c);
                // console.log('\n', attr);
                // 生成 attr
                const html = `
${slideTag[i]}
${headerHtml}
${subjectHtml}
<div class="wrap" wrap="true">
${attr}
</div>
${footerHtml}
</slide>
      `;
                // console.log('contentHtml\n', html)
                // 生成 content ast
                return posthtml(buildInPosthtmlPlugins.concat(posthtmlPlugins)).process(html, { sync: true }).html;
            })
            .join('\n');
    };
};
