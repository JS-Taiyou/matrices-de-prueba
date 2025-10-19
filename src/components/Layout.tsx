import { Html } from '@elysiajs/html'


const documentsOk = true;
export const Layout = ({ children, loadedPage = 'extractor' }: { children: any, loadedPage?: string }) => (
  <html data-theme="abyss">
    <head>
    {/* <script src="assets/js/htmx.min.js" integrity="sha384-HGfztofotfshcF7+8n44JQL2oJmowVChPTg48S+jvZoztPfvwD79OC/LTtG6dMp+" crossorigin="anonymous"></script> */}
    <style>
        @import "assets/css/style.css";
    </style>

    </head>
    <body>
        <div class="navbar bg-primary text-primary-content">
            <div class="flex-1">
                <button class="btn btn-ghost text-xl">Mensajeria</button>
            </div>
        </div>
        {/* <div class="flex grow justify-center">
            <ul class="menu bg-base-200 lg:menu-horizontal rounded-box">
                <li class={documentsOk ? "" : "tooltip tooltip-secondary tooltip-bottom"} data-tip={documentsOk ? "" : "Debes actualizar tus datos"}>
                    <a class={documentsOk ? "" : "disabled"} id="request-button"
                        hx-get="/requests"
                        hx-target="#main-content"
                        hx-swap="innerHTML"
                        hx-push-url="/requests"
                        hx-trigger="click[window.location.pathname !== '/requests']">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                            class="h-5 w-5" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                    </a>
                </li>
                <li>
                    <a>
                        Datos {documentsOk ? "correctos" : "faltantes"}
                        <span class={documentsOk ? "badge badge-xs badge-info" : "badge badge-xs badge-secondary"}></span>
                    </a>
                </li>
            </ul>
        </div> */}
        <div class="flex grow justify-center p-4" id="main-content">
            {children}
        </div>
    </body>
    <script src="assets/js/main.js"></script>
  </html>
)
