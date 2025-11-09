#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const distEntry = path.join(root, 'dist', 'index.js');
const srcEntry  = path.join(root, 'src', 'index.ts');

// Preferir build se existir
if (fs.existsSync(distEntry)) {
  require(distEntry);
} else {
  // fallback para dev: ts-node
  try {
    require('ts-node/register');
  } catch (e) {
    console.error(
      '[brasiliana] build não encontrado e ts-node ausente.\n' +
      'Instale ts-node como devDependency ou rode "npm run build".'
    );
    process.exit(1);
  }
  require(srcEntry);
}
