function getTable() {
    return $("#tableName").html();
}

function parseData(data) {
    let newData = {};
    for (const input of data) {
        if (!input.value) continue;
        if (input.name.includes("[]")) { 
            let key = input.name.replace("[]", "");
            if (newData[key]) {
                newData[key].push(input.value);
            } else {
                newData[key] = [input.value];
            }
        } else {
            let key = input.name;
            newData[key] = input.value;
        };
    }
    console.log(newData, Object.keys(newData).length)
    //asfadsfsdf()
    return newData;
}

function fastDELETE() {
    const { ids, items } = getChecked(true);
    sendRequest("DELETE", { apiTarget: "tables" }, { ids })
    items.remove();
}

function setGET() {
    $("a[view]").click((e) => {
        window.api.send("clientGET", $(e.currentTarget).attr('view'));
    })
}

function sendRequest(type, preData, data, postData={}) {
    window.api.send(type, { 
        tableName: getTable(),
        extra: data,
        preData,
        postData
    });
}


const sendStandardRequest = (formID) => {
    const form = $(`#${formID}`);
    const { ids } = getChecked();

    let data = parseData(form.serializeArray());
    let method = "";
    let preData = {};
    let postData = {};

    switch (formID) {
        case "modifyCheckedForm": case "modifyCheckedFormFUN":
            let qKeys = Object.keys(data).length;
            if ((qKeys <= 1 && formID === "modifyCheckedForm") || (qKeys <= 3 && formID === "modifyCheckedFormFUN")) return;
            console.log('xd')
            data.id = ids;
            method = "SET";
            preData = { apiTarget: "tables", apiTable: "ALL" };
            postData = { target: "updateTable" };
            break;

        case "createEntryForm":
            method = "SET";
            preData = { apiTarget: "tables" };
            postData = { target: "createEntry" };
            break;
    
        case "modifyForm":
            method = "SET";
            preData = { apiTarget: "tables" };
            postData = { 
                target: "updateEntry",
                id: data.id[0]
             };
            break;

        case "createColumnForm": case "createRelatedsForm":
            method = "SET";
            preData = { apiTarget: "admin" };
            postData = { target: "updateTable" };
            break;

        case "deleteColumnForm":
            method = "DELETE";
            preData = { apiTarget: "admin" };
            postData = { target: "updateTable" };
            break;

        default:
            break;
    }

    sendRequest(method, preData, data, postData);
}

window.api.receive("serverPOST", (data) => {
    switch (data.target) {
        case "fillRelateds":
            fillRelateds(data.admin, data.HTMLPATH, data.ELEM)
            break;

        case "createEntry":
            $('#dataTable tbody').append( createEntry([data.ELEM], data.admin) );
            table_animate(data.admin);
            break;

        case "updateEntry":
            $('#' + data.id).replaceWith( createEntry([data.ELEM], data.admin) );
            table_animate(data.admin);
            break;

        case "updateTable":
            fillTable(data.tableEntrys, data.admin);
            break;

        case "updateModifyForm":
            fillModifyForm(data.admin, data.ELEM, data.id)
            break;

        default:
            break;
    }
});

window.api.receive("serverGET", (data) => {
    if (data.tablesNames) fillTablesNames(data.tablesNames);

    $('#template_insert').load(`./${data.view}.html`, () => {
        if (data.tableName) {
            fillTableName(data.tableName);
            fillTable(data.tableEntrys, data.admin);
        } else if (data.admin) {
            fillUtilities(data.admin);
        };
        setGET();
    });
});

window.api.send("START", true) 