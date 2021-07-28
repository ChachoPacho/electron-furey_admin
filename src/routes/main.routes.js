
const {
    ipcMain
} = require('electron');

const TABLES = require('../controllers/tables.controller');
const ADMIN = require('../controllers/admin.controller');

function createRoutes(window) {
    //EVENTOS PERSONALIZADOS
    ipcMain.on("clientGET", (event, view) => {
        let data = { view }
        if (view.includes("table")) {
            let tableName = view.replace("table/", "");
            let tableEntrys = new TABLES(tableName).data;
            let admin = new ADMIN(tableName).data; 
            data = {
                view: "table",
                tableName,
                tableEntrys,
                admin
            }
        } else if (view === "utilities") {
            let admin = new ADMIN().data;
            data = {
                view,
                admin
            }
        }
        window.webContents.send("serverGET", data);
    });

    ipcMain.on("clientPOST", (event, args) => {
        if (args.preData.apiTarget.includes("tables")){
            args.postData.ELEM = new TABLES(args.tableName, args.extra).data;
        }
        if (args.preData.apiTarget.includes("admin")) {
            args.postData.admin = new ADMIN(args.tableName, args.extra).data;
        }

        window.webContents.send("serverPOST", args.postData);
    });

    ipcMain.on("START", () => {
        const tablesNames = Object.keys(new ADMIN().data);
        window.webContents.send("serverGET", {
            tablesNames,
            view: "index"
        });
    });

    ipcMain.on("DELETE", (event, args) => {
        if (args.preData.apiTarget === "tables")
            new TABLES(args.tableName, args.extra).removeElements()

        else if (args.preData.apiTarget === "admin") {
            const adminConnection = new ADMIN(args.tableName, args.extra);
            adminConnection.removeObject()

            args.postData.admin = adminConnection.data;
            args.postData.tableEntrys = new TABLES(args.tableName).data;
            window.webContents.send("serverPOST", args.postData);
        }

    });

    ipcMain.on("SET", (event, args) => {
        if (args.preData.apiTarget === "tables") {
            const tableConnection = new TABLES(args.tableName, args.extra);
            args.postData.ELEM = tableConnection.setElement();
            args.postData.admin = new ADMIN(args.tableName, args.extra).data;

            args.postData.tableEntrys = (args.preData.apiTable) ? tableConnection.data : null ;

            window.webContents.send("serverPOST", args.postData);
        } else if (args.preData.apiTarget === "admin") {
            const adminConnection = new ADMIN(args.tableName, args.extra);
            adminConnection.setObject()

            args.postData.admin = adminConnection.data;
            args.postData.tableEntrys = new TABLES(args.tableName).data;
            window.webContents.send("serverPOST", args.postData);
        }

    });
}

module.exports = { createRoutes }