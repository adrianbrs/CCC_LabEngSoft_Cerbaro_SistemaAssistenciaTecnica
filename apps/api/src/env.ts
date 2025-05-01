import { config } from '@dotenvx/dotenvx';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { PackageJson } from 'type-fest';

const NODE_ENV = process.env.NODE_ENV || 'development';

const ENV_FILES = [
  '.env',
  '.env.local',
  `.env.${NODE_ENV}`,
  `.env.${NODE_ENV}.local`,
];

ENV_FILES.forEach((file) => {
  config({
    path: resolve(process.cwd(), file),
    override: true,
    ignore: ['MISSING_ENV_FILE'],
  });
});

// VERSION
(() => {
  const pkg = JSON.parse(
    readFileSync(resolve(process.cwd(), 'package.json'), 'utf-8'),
  ) as PackageJson;
  process.env.VERSION = pkg.version!;
})();
