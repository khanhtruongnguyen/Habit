import fs from 'node:fs';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

function standaloneSingleFilePlugin(): Plugin {
  return {
    name: 'standalone-singlefile-html',
    apply: 'build',
    closeBundle() {
      const rootDir = process.cwd();
      const distDir = path.resolve(rootDir, 'dist');
      const devHtmlPath = path.resolve(rootDir, 'dev.html');
      const assetsDir = path.resolve(distDir, 'assets');

      if (!fs.existsSync(devHtmlPath) || !fs.existsSync(assetsDir)) return;

      const template = fs.readFileSync(devHtmlPath, 'utf-8');
      const assetFiles = fs.readdirSync(assetsDir);

      const cssContent = assetFiles
        .filter((f) => f.endsWith('.css'))
        .map((f) => fs.readFileSync(path.join(assetsDir, f), 'utf-8'))
        .join('\n');

      const jsContent = assetFiles
        .filter((f) => f.endsWith('.js'))
        .map((f) => fs.readFileSync(path.join(assetsDir, f), 'utf-8'))
        .join('\n')
        .replace(/<\/script>/gi, '<\\/script>');

      let standalone = template.replace(
        /<script\s+type="module"\s+src="\/src\/main\.tsx"><\/script>/i,
        ''
      );
      standalone = standalone.replace(
        '</head>',
        () => `  <style>\n${cssContent}\n  </style>\n</head>`
      );
      standalone = standalone.replace(
        '</body>',
        () => `  <script>\n${jsContent}\n  </script>\n</body>`
      );

      fs.writeFileSync(path.join(distDir, 'index.html'), standalone, 'utf-8');
      fs.writeFileSync(path.join(rootDir, 'index.html'), standalone, 'utf-8');
    },
  };
}

export default defineConfig({
  plugins: [react(), standaloneSingleFilePlugin()],
  build: {
    rollupOptions: {
      input: 'dev.html',
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'assets/app.js',
        assetFileNames: 'assets/app.[ext]',
      },
    },
  },
});
