import * as esbuild from 'esbuild';
import fs from 'fs';
const r = await esbuild.build({ entryPoints:['src/main.js'], bundle:true, minify:true, format:'iife', write:false, target:'es2020' });
let js = r.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
const html = fs.readFileSync('src/template.html','utf8').replace('/*BUNDLE*/', () => js);
fs.writeFileSync('index.html', html);
console.log('ok', (html.length/1024).toFixed(0)+'KB');
