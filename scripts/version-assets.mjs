import {createHash} from 'node:crypto';
import {readdir,readFile,writeFile} from 'node:fs/promises';
const root=new URL('../public/',import.meta.url);
const names=(await readdir(root)).filter(name=>/\.(js|css|html|json)$/.test(name)).sort();
const strip=s=>s.replace(/(\.(?:js|css|html))\?v=[a-f0-9]{12}/g,'$1');
const contents=new Map(await Promise.all(names.map(async name=>[name,strip(await readFile(new URL(name,root),'utf8'))])));
const hash=createHash('sha256');for(const [name,text]of contents)hash.update(name+'\0'+text+'\0');hash.update(await readFile(new URL('vendor/firebase.js',root)));
const version=hash.digest('hex').slice(0,12);
for(const [name,original]of contents){
 let text=original;
 if(name.endsWith('.js'))text=text.replace(/(['"])(\.\/(?:vendor\/)?[\w.-]+\.js)\1/g,(_,quote,path)=>`${quote}${path}?v=${version}${quote}`);
 if(name.endsWith('.html'))text=text.replace(/((?:src|href)="(?:boot\.js|style\.css|[\w-]+\.html))"/g,`$1?v=${version}"`);
 if(text!==await readFile(new URL(name,root),'utf8'))await writeFile(new URL(name,root),text);
}
await writeFile(new URL('asset-version.txt',root),version+'\n');
console.log('Browser asset version:',version);
