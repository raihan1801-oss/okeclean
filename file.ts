import type { Env } from 'global';
import type EnvType from './.env.json';

import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';
import Dotenv from "dotenv";
import chalk from 'chalk';

Dotenv.config();

const {env} = process as Env<typeof EnvType>;

console.log(chalk.bgBlack.white`Remove Public Directory`, chalk.blue`[*]`);
for (const dir of fs.readdirSync(env.SERVER_PUBLIC_DIR)) {
  const DEST = path.join(env.SERVER_PUBLIC_DIR, dir);
  rimraf.sync(DEST);
  console.log('remove dir on:', DEST);
}
console.log(chalk.bgBlack.white`Remove Public Directory`, chalk.green`[*]`);
console.log(chalk.bgBlack.white`Remove Private Directory`, chalk.blue`[*]`);
for (const dir of fs.readdirSync(env.SERVER_PRIVATE_DIR)) {
  const DEST = path.join(env.SERVER_PRIVATE_DIR, dir);
  rimraf.sync(DEST);
  console.log('remove dir on:', DEST);
}
console.log(chalk.bgBlack.white`Remove Private Directory`, chalk.green`[*]`);
