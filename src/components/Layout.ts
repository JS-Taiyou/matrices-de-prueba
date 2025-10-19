import { Html } from '@elysiajs/html'


const documentsOk = true;
export const Layout = ({ children, loadedPage = 'extractor' }: { children: any, loadedPage?: string }) => Html.createElement('html', { 'data-theme': 'abyss' },
  Html.createElement('head', {},
    Html.createElement('script', { defer: true, src: 'https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js' }),
    Html.createElement('style', {}, '@import "assets/css/style.css";')
  ),
  Html.createElement('body', {},
    Html.createElement('div', { class: 'navbar bg-primary text-primary-content' },
      Html.createElement('div', { class: 'flex-1' },
        Html.createElement('button', { class: 'btn btn-ghost text-xl' }, 'Mensajeria')
      )
    ),
    Html.createElement('div', { class: 'flex grow justify-center p-4', id: 'main-content', 'x-data': "{ content: '' }", 'x-init': "content = await (await fetch('/extractor-content')).text()", 'x-html': 'content' }),
    Html.createElement('script', { src: 'assets/js/main.js' })
  )
)
