const fs = require('fs');
const glob = require('fast-glob');

const files = glob.sync('src/**/*.ts');
let count = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Exact match for "import type { PoolClient } from '@bridgeshop/postgres-query-builder';"
  content = content.replace(
    /import\s+type\s*\{\s*PoolClient\s*\}\s*from\s*['"]@bridgeshop\/postgres-query-builder['"];?/g,
    "import type { PoolClient } from 'pg';"
  );

  // Exact match for "import { PoolClient } from '@bridgeshop/postgres-query-builder';"
  content = content.replace(
    /import\s*\{\s*PoolClient\s*\}\s*from\s*['"]@bridgeshop\/postgres-query-builder['"];?/g,
    "import type { PoolClient } from 'pg';"
  );

  // Partial match where PoolClient is imported alongside other things
  if (content.includes('PoolClient') && content.includes('@bridgeshop/postgres-query-builder')) {
    // Remove PoolClient from the list of imports from postgres-query-builder
    content = content.replace(/\bPoolClient\b\s*,?\s*/g, '');
    
    // Add the import to 'pg' at the top if it's not already there
    if (!content.includes("import type { PoolClient } from 'pg';") && !content.includes("import { PoolClient } from 'pg';")) {
      content = "import type { PoolClient } from 'pg';\n" + content;
    }
  }

  // Clean empty brackets like import { } from ...
  content = content.replace(/import\s*\{\s*\}\s*from\s*['"]@bridgeshop\/postgres-query-builder['"];?/g, '');

  if (content !== original) {
    fs.writeFileSync(file, content);
    count++;
  }
}

console.log(`Replaced PoolClient in ${count} files.`);
