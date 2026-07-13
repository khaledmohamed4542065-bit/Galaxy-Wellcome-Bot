import { ensureFonts } from './utils/fontLoader.js';
import { generateWelcomeGif } from './utils/welcomeGif.js';
import fs from 'fs';

console.log('Starting GIF generation test with custom fonts...');

try {
    await ensureFonts();
    console.time('GIF Generation');
    const buffer = await generateWelcomeGif('Khal3d0047', null);
    console.timeEnd('GIF Generation');

    console.log('GIF generated successfully. Size:', (buffer.length / 1024 / 1024).toFixed(2), 'MB');
    fs.writeFileSync('test_welcome.gif', buffer);
    console.log('Saved test GIF to test_welcome.gif');
} catch (error) {
    console.error('Error during test:', error);
}

process.exit(0);
