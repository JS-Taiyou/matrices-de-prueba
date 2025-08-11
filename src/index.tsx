import { Elysia, file } from "elysia";

import { staticPlugin } from '@elysiajs/static'
import { html, Html } from '@elysiajs/html'
import { spawnSync } from "child_process";
import { watch } from "fs";
import { extractor } from './extractor'

if(process.env && process.env.npm_lifecycle_event === "dev") {
    
  const watcher = watch('src/origin.css', (event, filename) => {
      console.log('Regenerating CSS...')  

      const tw = spawnSync('bun', [ 'tailwindcss', '-i', 'src/origin.css', '-o', 'public/css/style.css' ], {
          stdio: 'inherit'
      });
  });
}
const app = new Elysia(
  {
    serve: {
      hostname: "localhost",
    },
    nativeStaticResponse: true,
  }
)
  .use(html())
  .use(extractor)

  .use(
    staticPlugin({
        prefix: '/assets',
        alwaysStatic: true,
    })
)
  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
