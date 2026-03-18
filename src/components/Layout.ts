import { Html } from '@elysiajs/html'


const documentsOk = true;
export const Layout = ({ children, loadedPage = 'extractor' }: { children: any, loadedPage?: string }) => Html.createElement('html', { 'data-theme': 'abyss' },
  Html.createElement('head', {},
    Html.createElement('script', { defer: true, src: 'https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js' }),
    Html.createElement('style', {}, '@import "assets/css/style.css";')
  ),
  Html.createElement('body', { 'x-data': "{ content: '' }" },
    Html.createElement('div', { class: 'navbar bg-primary text-primary-content' },
      Html.createElement('div', { class: 'navbar-start' },
        Html.createElement('button', { class: 'btn btn-ghost text-xl', '@click': "content = await (await fetch('/extractor-content')).text(); history.pushState({}, '', '/')" }, 'Mensajeria')
      ),
      Html.createElement('div', { class: 'navbar-center lg:flex' },
        Html.createElement('ul', { class: 'menu menu-horizontal px-1' },
          Html.createElement('button', { class: 'btn btn-ghost', '@click': "content = await (await fetch('/revision-content')).text(); history.pushState({}, '', '/revision')" }, 'Revision'),
          Html.createElement('button', { class: 'btn btn-ghost', '@click': "content = await (await fetch('/queries-content')).text(); history.pushState({}, '', '/queries')" }, 'Queries'),
          Html.createElement('button', { class: 'btn btn-ghost', '@click': "content = await (await fetch('/documentacion-content')).text(); history.pushState({}, '', '/documentacion')" }, 'Documentación'),
        )
      )
    ),
    Html.createElement('div', { class: 'flex grow justify-center p-4', id: 'main-content', 'x-init': `content = await (await fetch('/${loadedPage}-content')).text(); history.pushState({}, '', '/${loadedPage}')`, 'x-html': 'content' }, children),
    Html.createElement('script', { src: 'assets/js/main.js' }),
    Html.createElement('script', { src: 'assets/js/queries.js' }),
    Html.createElement('script', { src: 'assets/js/dynamic-form.js' }),
    Html.createElement('script', { src: 'assets/js/documentacion.js' })
  )
)
