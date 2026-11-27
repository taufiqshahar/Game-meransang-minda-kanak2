import { readFileSync } from 'node:fs';
export const GAME_IDS = async () => [...readFileSync(new URL('../app/games/registry.js', import.meta.url), 'utf8').matchAll(/\{ id: '([a-z0-9-]+)'/g)].map((m) => m[1]);
