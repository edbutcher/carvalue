import { rm } from 'fs/promises';
import { join } from 'path';

global.beforeEach(async () => {
  try {
    await rm(join(__dirname, '..', 'test.sqlite'), {
      force: true,
      recursive: true,
    });
  } catch {}
});
