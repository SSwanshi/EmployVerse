import fs from 'fs';
import path from 'path';

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = walkSync(dirFile, filelist);
    } catch (err) {
      if (err.code === 'ENOTDIR' || err.code === 'EBUSY') {
        if (dirFile.endsWith('.jsx') || dirFile.endsWith('.js') || dirFile.endsWith('.css') || dirFile.endsWith('.html')) {
          filelist.push(dirFile);
        }
      }
    }
  });
  return filelist;
};

const files = walkSync('./src');
files.push('./index.html');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Text Replacements
  content = content.replace(/GoHire/g, 'EmployVerse');
  content = content.replace(/gohire\.com/g, 'employverse.com');

  // Remove Emojis (Regex matches most common emojis)
  content = content.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/gu, '');

  // Theme Replacements
  // Backgrounds
  content = content.replace(/bg-(blue|yellow|indigo|purple|pink)-(600|700|800|900|950)/g, 'bg-black');
  content = content.replace(/bg-(blue|yellow|indigo|purple|pink)-(400|500)/g, 'bg-gray-900');
  content = content.replace(/bg-(blue|yellow|indigo|purple|pink)-(50|100|200|300)/g, 'bg-gray-100');
  
  // Text
  content = content.replace(/text-(blue|yellow|indigo|purple|pink)-(600|700|800|900|950)/g, 'text-black');
  content = content.replace(/text-(blue|yellow|indigo|purple|pink)-(400|500)/g, 'text-gray-800');
  content = content.replace(/text-(blue|yellow|indigo|purple|pink)-(50|100|200|300)/g, 'text-gray-500');

  // Borders & Rings
  content = content.replace(/border-(blue|yellow|indigo|purple|pink)-\d+/g, 'border-black');
  content = content.replace(/ring-(blue|yellow|indigo|purple|pink)-\d+/g, 'ring-black');

  // Hovers
  content = content.replace(/hover:bg-(blue|yellow|indigo|purple|pink)-(600|700|800|900|950)/g, 'hover:bg-gray-900');
  content = content.replace(/hover:text-(blue|yellow|indigo|purple|pink)-(600|700|800|900|950)/g, 'hover:text-gray-700');

  // Gradients
  content = content.replace(/bg-gradient-to-[a-z]+/g, '');
  content = content.replace(/from-(blue|yellow|indigo|purple|pink)-\d+/g, 'bg-black text-white');
  content = content.replace(/to-(blue|yellow|indigo|purple|pink)-\d+/g, '');
  content = content.replace(/via-(blue|yellow|indigo|purple|pink)-\d+/g, '');
  
  // Embedded gradient classes in Navbar
  content = content.replace(/gradient-blue/g, 'bg-black text-white');

  // Replace any duplicate classes that might arise, or just let Tailwind handle it (it overrides).

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Processed: ${file}`);
});
console.log('Rebranding complete.');
