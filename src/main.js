const {
    BrowserWindow,
    Menu
} = require('electron');

const url = require('url');
const path = require('path');

let mainWindow;
let newProductWindow;

async function createWindow() {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: false, // is default value after Electron v5
            contextIsolation: true, // protect against prototype pollution
            enableRemoteModule: false, // turn off remote
            preload: path.join(__dirname, "preload.js") // use a preload script
          }
    });
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views/main.html'),
        protocol: 'file',
        slashes: true
    }))
    
    const mainMenu = Menu.buildFromTemplate(templateMenu);
    Menu.setApplicationMenu(mainMenu);

    return mainWindow;
}

function createNewProductWindow() {
    newProductWindow = new BrowserWindow({
        width: 400,
        height: 300,
        title: "Add a New Product"
    })
    newProductWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views/newProductWindow.html'),
        protocol: 'file',
        slashes: true
    }))

    newProductWindow.setMenu(null)
}

const templateMenu = [{
        label: "Archivo",
        submenu: [{
                label: "New Product",
                accelerator: "Ctrl+N",
                click() {
                    createNewProductWindow()
                }
            },
            {
                label: "Salir",
                accelerator: "Ctrl+Q",
                role: "quit"
            }
        ]
    },
    {
        label: "Configuración",
        submenu: [
            {
                label: "Importar Base de Datos",
            },
            {
                label: "Exportar Base de Datos",
            },
            {
                label: "Crear Base de Datos"
            }
        ]
    },
    {
        label: "Ayuda"
    }
]

// Developer Tools in Development Environment
if (process.env.NODE_ENV !== 'production') {
    templateMenu.push({
        label: 'DevTools',
        submenu: [{
                label: 'Show/Hide Dev Tools',
                accelerator: 'Ctrl+D',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                label: 'Actualizar',
                role: 'reload'
            }
        ]
    })
}

module.exports = {
    createWindow
}