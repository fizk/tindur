import {IncomingMessage, ServerResponse} from 'http';
import {extname} from 'path';
import {readFile} from 'fs/promises';

export const SkeletonHandler = async (request: IncomingMessage, response: ServerResponse) => {
    try {
        const file = await readFile(`./client/index.html`);
        response.writeHead(200, {
            'Content-Length': Buffer.byteLength(file),
            'content-type': 'text/html'
        }).end(file);
    } catch(error) {
        response.writeHead(404, {
            'Content-Length': 0,
            'content-type': 'text/html'
        }).end();
    }
}

export const NotFoundHandler = (request: IncomingMessage, response: ServerResponse) => {
    response.writeHead(404, {
        'Content-Length': 0,
        'Content-Type': 'text/html',
    }).end();
}

export const JsHandler = async (request: IncomingMessage, response: ServerResponse) => {
    const url = new URL(request.url!, 'http://any-host');
    const path = url.pathname?.split('/').filter(part => part !== '').slice(1).join('/');
    try {
        const file = await readFile(`./client/${path}`);
        response.writeHead(200, {
            'Content-Length': Buffer.byteLength(file),
            'content-type': 'application/javascript'
        }).end(file);
    } catch(error) {
        response.writeHead(404, {
            'Content-Length': 0,
            'content-type': 'application/javascript'
        }).end();
    }
}

export const CssHandler = async (request: IncomingMessage, response: ServerResponse) => {
    const url = new URL(request.url!, 'http://any-host');
    const path = url.pathname?.split('/').filter(part => part !== '').slice(1).join('/');
    try {
        const file = await readFile(`./client/${path}`);
        response.writeHead(200, {
            'Content-Length': Buffer.byteLength(file),
            'content-type': 'text/css'
        }).end(file);
    } catch(error) {
        response.writeHead(404, {
            'Content-Length': 0,
            'content-type': 'application/javascript'
        }).end();
    }
}

export const ManifestHandler = async (request: IncomingMessage, response: ServerResponse) => {
    const manifest = {
        id: '/tindur',
        name: "Tindur's Dashboard",
        short_name: 'Tindur',
        orientation: 'portrait',
        display: 'standalone',          // fullscreen, standalone, minimal-ui, browser
        background_color: '#dde7ea',    // member defines a placeholder background color for 
                                        //      the application page to display before its stylesheet is loaded.
        theme_color: '#dde7ea',         // The theme_color member is a string that defines the default 
                                        //      theme color for the application. This sometimes affects how the OS displays the site
        start_url: '/tindur',           // start_url member is a string that represents 
                                        //      the start URL of the web application — the preferred URL that should be 
                                        //      loaded when the user launches the web application
        icons: [                        //      icons must contain a 192px and a 512px icon
            {
                src: '/tindur/icons/512.png',
                type: 'image/png',
                sizes: '512x512',
            },
            {
                src: '/tindur/icons/192.png',
                type: 'image/png',
                sizes: '192x193',
            },
        ],
        screenshots: [
            {
                src: "/tindur/images/screenshot1.png",
                type: "image/png",
                sizes: "540x720",
                form_factor: "narrow"
            },
            {
                src: "/tindur/images/screenshot2.png",
                type: "image/png",
                sizes: "720x540",
                form_factor: "wide"
            }
        ]
    };
    const manifestDocument = JSON.stringify(manifest, undefined, 4);
    
    response.writeHead(200, {
        'Content-Length': Buffer.byteLength(manifestDocument),
        'content-type': 'application/manifest+json'
    }).end(manifestDocument);

}

export const IconRastarHandler = async (request: IncomingMessage, response: ServerResponse) => {
    const url = new URL(request.url!, 'http://any-host');
    const path = url.pathname?.split('/').filter(part => part !== '');
    try {
        const file = await readFile(`./client/icons/${path.pop()}`);
        response.writeHead(200, {
            'Content-Length': Buffer.byteLength(file),
            'content-type': 'image/png'
        }).end(file);
    } catch (error) {
        response.writeHead(404, {
            'Content-Length': 0,
            'content-type': 'application/javascript'
        }).end();
    }
}

export const RastarImageHandler = async (request: IncomingMessage, response: ServerResponse) => {
    const url = new URL(request.url!, 'http://any-host');
    const path = url.pathname?.split('/').filter(part => part !== '');
    
    const category = path.at(1);
    const fileName = path.at(-1);
    const ext = extname(path.at(-1) || '');

    const map: Record<string, string> = {
        '.png': 'image/png',
        '.jpg': 'image/jpg',
    }

    try {
        const file = await readFile(`./client/${category}/${fileName}`);
        response.writeHead(200, {
            'Content-Length': Buffer.byteLength(file),
            'content-type': map[ext]
        }).end(file);
    } catch (error) {
        response.writeHead(404, {
            'Content-Length': 0,
            'content-type': 'application/javascript'
        }).end();
    }
}

export const IconVectorHandler = async (request: IncomingMessage, response: ServerResponse) => {
    const url = new URL(request.url!, 'http://any-host');
    const path = url.pathname?.split('/').filter(part => part !== '');
    try {
        const file = await readFile(`./client/icons/${path.pop()}`);
        response.writeHead(200, {
            'Content-Length': Buffer.byteLength(file),
            'content-type': 'image/svg+xml'
        }).end(file);
    } catch (error) {
        response.writeHead(404, {
            'Content-Length': 0,
            'content-type': 'application/javascript'
        }).end();
    }
}

export const FontOtfHandler = async (request: IncomingMessage, response: ServerResponse) => {
    const url = new URL(request.url!, 'http://any-host');
    const path = url.pathname?.split('/').filter(part => part !== '');
    try {
        const file = await readFile(`./client/fonts/${path.pop()}`);
        response.writeHead(200, {
            'Content-Length': Buffer.byteLength(file),
            'content-type': 'font/otf'
        }).end(file);
    } catch (error) {
        response.writeHead(404, {
            'Content-Length': 0,
            'content-type': 'application/javascript'
        }).end();
    }
}

export const FontWoffHandler = async (request: IncomingMessage, response: ServerResponse) => {
    const url = new URL(request.url!, 'http://any-host');
    const path = url.pathname?.split('/').filter(part => part !== '');
    try {
        const file = await readFile(`./client/fonts/${path.pop()}`);
        response.writeHead(200, {
            'Content-Length': Buffer.byteLength(file),
            'content-type': 'font/woff'
        }).end(file);
    } catch (error) {
        response.writeHead(404, {
            'Content-Length': 0,
            'content-type': 'application/javascript'
        }).end();
    }
}
