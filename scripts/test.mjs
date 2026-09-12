import { build } from 'esbuild';
import { mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
await mkdir('.test-output',{recursive:true});
await build({entryPoints:['tests/gauntlet.ts'],bundle:true,platform:'node',format:'esm',packages:'external',outfile:'.test-output/gauntlet.mjs'});
const child=spawn(process.execPath,['--test','.test-output/gauntlet.mjs'],{stdio:'inherit'});child.on('exit',code=>process.exit(code??1));
