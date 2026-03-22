import { Elysia, file } from "elysia";

import { staticPlugin } from '@elysiajs/static'
import { html, Html } from '@elysiajs/html'
import { spawnSync } from "child_process";
import { watch, mkdirSync, existsSync } from "fs";
import { extractor } from './components/pages/extractor'
import { queries } from './components/pages/queries'
import { Layout } from './components/Layout'
import { revision } from "./components/pages/revision";
import { documentacion } from "./components/pages/documentacion";
import { getFieldsWithOptions } from './db/queries'
import './db/seed';


if(process.env && process.env.npm_lifecycle_event === "dev") {
  // Ensure output directory exists (fixes Windows issue)
  const cssDir = 'public/css';
  if (!existsSync(cssDir)) {
    mkdirSync(cssDir, { recursive: true });
  }

  const tw = spawnSync('bun', [ 'tailwindcss', '-i', 'src/origin.css', '-o', 'public/css/style.css' ], {
      stdio: 'inherit'
  });
}
const app = new Elysia(
  {
    // serve: {
    //   hostname: "localhost",
    // },
    nativeStaticResponse: true,
  }
)
  .use(html())
  .get('/', ({ html }) => html(
		Html.createElement(Layout, {})
	))
  .use(extractor)
  .use(queries)
  .use(revision)
  .use(documentacion)

  .use(
    staticPlugin({
        prefix: '/assets',
        alwaysStatic: true,
    })
)
  .get('/api/fields', () => getFieldsWithOptions())
  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
