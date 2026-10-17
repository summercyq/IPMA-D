import {build} from 'esbuild';
await build({entryPoints:['scripts/firebase-entry.js'],bundle:true,format:'esm',platform:'browser',target:['es2020'],minify:true,legalComments:'eof',outfile:'public/vendor/firebase.js'});
