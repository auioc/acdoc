#!/bin/sh

mv public temp
mkdir public

npm install

# Version
commit=$(git rev-parse --verify HEAD)
branch=$(git branch --show-current)
sed -i "s;{version};$branch@$commit;g" src/main.ts
sed -i "s;{version};$branch@$commit;g" temp/style.css

node_modules/.bin/rollup -c

echo '{"compress":{"pure_funcs":["console.debug"]},"ecma":2017}' >temp/terser.json
node_modules/.bin/terser --config-file temp/terser.json public/acdoc.js >public/acdoc.min.js

cp temp/style.css public/acdoc.css
node_modules/.bin/html-minifier-terser --collapse-whitespace public/acdoc.css >public/acdoc.min.css
