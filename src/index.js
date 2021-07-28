const { createWindow } = require('./main');
const { createConnection } = require("./database");
const { createRoutes } = require("./routes/main.routes")

const { app } = require('electron');

const path = require('path');

if (process.env.NODE_ENV !== "production") {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, '../node_modules', '.bin', 'electron')
    })
}

app.setName('FureyAdmin');
app.whenReady().then(async () => {
    await createConnection();
    mainWindow = await createWindow(app);

    mainWindow.on('closed', () => {
        app.quit();
    })

    createRoutes(mainWindow);
})