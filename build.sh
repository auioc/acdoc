#!/bin/sh

mkdir temp

npm install

# Version
commit=$(git rev-parse --verify HEAD)
branch=$(git branch --show-current)
sed -i "s;{version};$branch@$commit;g" src/core/main.ts
sed -i "s;{version};$branch@$commit;g" src/style/main.scss

node_modules/.bin/rollup -c

echo '{"compress":{"pure_funcs":["console.debug"]},"ecma":2017}' >temp/terser.json
node_modules/.bin/terser --config-file temp/terser.json dist/acdoc.js >dist/acdoc.min.js

node_modules/.bin/sass --no-source-map src/style/main.scss:dist/style.css
node_modules/.bin/sass --no-source-map --style compressed src/style/main.scss:dist/style.min.css
