"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[5018],{5018:function(e,t,n){n.r(t),n.d(t,{default:function(){return o}});function o(e={}){let{prefixId:t="footnote-",prefixData:n="",description:o="Footnotes",refMarkers:r=!1,footnoteDivider:s=!1,keepLabels:l=!1,sectionClass:a="footnotes",headingClass:i="sr-only",backRefLabel:f="Back to reference {0}"}=e,p={hasFootnotes:!1,tokens:[]};return{extensions:[function(e,t){let n={type:"footnotes",raw:t,rawItems:[],items:[]};return{name:"footnote",level:"block",childTokens:["content"],tokenizer(t){e.hasFootnotes||(this.lexer.tokens.push(n),e.tokens=this.lexer.tokens,e.hasFootnotes=!0,n.rawItems=[],n.items=[]);let o=/^\[\^([^\]\n]+)\]:(?:[ \t]+|[\n]*?|$)([^\n]*?(?:\n|$)(?:\n*?[ ]{4,}[^\n]*)*)/.exec(t);if(o){let[e,t,r=""]=o,s=r.split(`
`).reduce((e,t)=>e+`
`+t.replace(/^(?:[ ]{4}|[\t])/,""),""),l=s.trimEnd().split(`
`).pop();s+=l&&/^[ \t]*?[>\-*][ ]|[`]{3,}$|^[ \t]*?[|].+[|]$/.test(l)?`

`:"";let a={type:"footnote",raw:e,label:t,refs:[],content:this.lexer.blockTokens(s)};return n.rawItems.push(a),a}},renderer:()=>""}}(p,o),function(e,t=!1,n=!1){let o=0;return{name:"footnoteRef",level:"inline",tokenizer(e){let t=/^\[\^([^\]\n]+)\]/.exec(e);if(t){let[e,n]=t,r=this.lexer.tokens[0],s=r.rawItems.filter(e=>e.label===n);if(!s.length)return;let l=s[0],a=r.items.filter(e=>e.label===n)[0],i={type:"footnoteRef",raw:e,index:l.refs.length,id:"",label:n};return a?(i.id=a.refs[0].id,a.refs.push(i)):(o++,i.id=String(o),l.refs.push(i),r.items.push(l)),i}},renderer({index:r,id:s,label:l}){o=0;let a=encodeURIComponent(l),i=n?l.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;"):s,f=r>0?`-${r+1}`:"";return`<sup><a id="${e}ref-${a}${f}" href="#${e+a}" data-${e}ref aria-describedby="${e}label">${t?`[${i}]`:i}</a></sup>`}}}(t,r,l),{name:"footnotes",renderer({raw:e,items:o=[]}){if(0===o.length)return"";let r=o.reduce((e,{label:n,content:o,refs:r})=>{let s=encodeURIComponent(n),l=this.parser.parse(o).trimEnd(),a=l.endsWith("</p>"),i=`<li id="${t+s}">
`;return i+=a?l.replace(/<\/p>$/,""):l,r.forEach((e,o)=>{let r,l;let a=f.replace("{0}",n);if(o>0){let e=o+1;r=`↩<sup>${e}</sup>`,l=`-${e}`}else r="↩",l="";i+=` <a href="#${t}ref-${s}${l}" data-${t}backref aria-label="${a}">${r}</a>`}),e+(i+=(a?`</p>
`:`
`)+`</li>
`)},""),l="";s&&(l+=`<hr data-${n}footnotes>
`);let p="";a&&(p=` class="${a}"`);let c="";return i&&(c=` class="${i}"`),l+=`<section${p} data-${n}footnotes>
<h2 id="${t}label"${c}>${e.trimEnd()}</h2>
<ol>
${r}</ol>
</section>
`}}],walkTokens(e){"footnotes"===e.type&&0===p.tokens.indexOf(e)&&e.items.length&&(p.tokens[0]={type:"space",raw:""},p.tokens.push(e)),p.hasFootnotes&&(p.hasFootnotes=!1)}}}}}]);