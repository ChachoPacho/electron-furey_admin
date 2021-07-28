//GLOBAL
function fillTablesNames(tablesNames) {
    let tables = "";
    
    for (const name of tablesNames) {
        tables += `<a class="collapse-item text-capitalize" href="#" view="table/${name}">${name}</a>`
    }
    
    $('#tablesNames').html(tables);
}


//TABLES
function fillTableName(tableName) {
    $("#tableName").html(tableName);
}

function createEntry(table, admin) {
    const { __SHOW, __REL } = admin;
    const relations = Object.keys(__REL);
    let tableContEnd = '';
    let cont = "";

    for (const ELEM of table) {
        tableContEnd += `
            <tr id="` + ELEM.id + `">
                <td class="text-center" style="width:40px">
                    <input type="checkbox">
                </td>
            `

        for (const index of __SHOW) {
            if (relations.includes(index)) {
                cont = " related='true'>" + (eval(__REL[index]) || " ");
            } else {
                cont = ">" + (ELEM[index] || " ");
            }
            tableContEnd += "<td" + cont + "</td>";
        }

        tableContEnd += `</tr>`;
    }

    return tableContEnd;
}

const fillTable = async (table, admin, data="") => {
    //table = filterSearch(table);
    const { __ALL, __SHOW, __REL } = admin;
    const relations = Object.keys(__REL);
    
    let tableContEnd = createEntry(table, admin);

    if (data) {
        var order = (data.orderby[1] === "desc") ? 'asc' : 'desc';
        //localStorage.setItem('orderby', order);
    } else {
        var order = 'desc';
        //localStorage.removeItem('orderby');
    };
    
    let tableHeader = `<th class="text-center" style="width:40px"><input type="checkbox" id="checkALL"></th>`;
    let tableFooter = `<th class="text-center" style="width:40px"></th>`;
    let cont = "";
    let text = "";

    for (const index of __SHOW) {
        if (relations.includes(index)) {
            cont = "";
            text = "text-uppercase text-primary";
        } else {
            cont = `
            <div class="ms-auto" type="button" id="menu-${index}"
                onclick="orderBy('${index}','${order}')">
                <i class="fas fa-arrows-alt-v"></i>
            </div>`;
            text = "text-capitalize";
        }
        tableHeader += `
            <th>
                <div class="d-flex">
                    <div class="dropdown">
                        <div class="${text}" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            ${__ALL[index]}
                        </div>
                        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                            <form class="d-flex fureyForm" action="/admin/object/${table}" method="PUT">
                                <input type="hidden" name="objtype" value="col">
                                <input type="hidden" name="origin" value="${index}">
                                <input class="mt-0 mx-2 p-1 ${text}" type="text" name="field" value="${__ALL[index]}">
                                <button type="submit" class="btn btn-warning me-2 p-1">
                                    <span class="text">Actualizar</span>
                                </button>
                            </form>
                        </div>
                    </div>
                    ${cont}
                </div>
            </th>
            `;
        tableFooter += `
            <th class="${text}">
                <div>${__ALL[index]}</div>
            </th>
        `;
    }

    $('#dataTable thead tr').html(tableHeader);
    $('#dataTable tfoot tr').html(tableFooter);
    $('#dataTable tbody').html(tableContEnd);
    fillForms(admin);
}

const fillForms = async (admin) => {
    const { __ALL, __REL } = admin;
    const relKeys = Object.keys(__REL);

    let table = '';
    let modifyCheckedForm = '<input type="hidden" name="target" value="col">';
    let checkBoxCol = '';
    let select = "";
    let indexHelp = "";
    let i = 0;

    for (const index in __ALL) {
        if (relKeys.includes(index)) continue;
        checkBoxCol += `
        <div class="form-check">
            <input class="form-check-input" type="checkbox" name="col[]" value="${index}" id="deleteCheckItem${index}">
            <label class="form-check-label text-capitalize" for="deleteCheckItem${index}">${__ALL[index]}</label>
        </div>`;
        table += `
        <div class="form-group">
            <label for="${index}FormInput" class="text-capitalize">${__ALL[index]}</label>
            <input type="text" name="${index}" class="form-control" id="${index}FormInput">
        </div>`;
        modifyCheckedForm += `
        <div class="form-group d-flex">
            <p class="text-capitalize my-auto">${__ALL[index]}:</p>
            <input type="text" name="${index}" class="form-control ms-auto w-75">
        </div>`;
        select += `<option value="${index}">${__ALL[index]}</option>`;
        indexHelp += `<code class="mx-4 text-nowrap text-capitalize">${__ALL[index]}: "{${i}}"</code>`;
        i++;
    }
        
    $('#modifyCheckedForm').html(modifyCheckedForm);
    $('#createEntryForm').html(table);
    $('#selectcreateColumnForm').html("<option value='check' selected>CHECK</option>" + select);
    $('#selectModifyForm').html(select);
    $('#deleteColumnCheckBoxCol').html(checkBoxCol);
    $('#functionIndex').html(indexHelp);
    table_animate(admin);
}

function fillModifyForm(admin, entry, id) {
    const { __ALL, __REL } = admin;
    const relations = Object.keys(__REL);
    let modifyForm = `<input type="hidden" name="target" value="col"><input type="hidden" name="id[]" value="${id}">`;

    for (const index in __ALL) {
        if (relations.includes(index)) continue;
        modifyForm += `
        <div class="form-group d-flex">
            <p class="text-capitalize my-auto">${__ALL[index]}:</p>
            <input type="text" name="${index}" class="form-control ms-auto w-75" value="${entry[index]}">
        </div>`;
    }

    $('#modifyForm').html(modifyForm);
}

function fillRelateds(admin, HTMLPATH, ELEM) {
    const {__REL, __SHOW} = admin;
    if (__REL) {
        const elementHTML_relateds = $(HTMLPATH).siblings('td[related]');
        for (const elementHTML of elementHTML_relateds) {
            $(elementHTML).html(eval(__REL[__SHOW[$(elementHTML).index() - 1]]));
        }
    }
}


//UTILITIES
async function fillUtilities(admin) {
    let tables = '';
    for (const name of Object.keys(admin)) {
        let table = '';
        const { __ALL, __SHOW } = admin[name];

        const qElements = Object.keys(__ALL).length;
        for (const element in __ALL) {
            let pos = (__SHOW.indexOf(element) !== -1) ? __SHOW.indexOf(element) + 1 : 0;
            table += `
            <div class="border-left-dark">
                <div class="card-body py-2 px-3 text-capitalize">
                    <div class="row">
                        <div class="col-6">${__ALL[element]}</div>
                        <div class="col-6 d-flex">
                            <input class="w-50 mx-auto" type="number" value="${pos}" name="pos[]" min="0" max="${qElements}">
                        </div>
                    </div>
                </div>
            </div>
            `;
        }

        tables += `
        <div class="col-12 col-md-6 col-lg-4">
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary text-capitalize">Tabla ${name}</h6>
                </div>
                <div class="card-body pt-0">
                    <div class="row py-2">
                        <div class="col-6 text-center text-gray-900"><strong>Campo</strong></div>
                        <div class="col-6 text-center text-gray-900"><strong>Posición</strong></div>
                    </div>
                    <form id="utilForm-${name}">
                        <input type="hidden" name="objtype" value="util">
                        <input type="hidden" name="tableid" value="${name}">
                        ${table}
                        <div class="d-flex w-100 justify-content-end">
                            <a class="btn btn-success btn-icon-split w-50 mx-3 mb-1 mt-3 d-flex" onclick="sendStandardRequest('utilForm-${name}')">
                                <span class="icon text-white-50 me-auto">
                                    <i class="fas fa-check"></i>
                                </span>
                                <span class="text me-auto">GUARDAR</span>
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        `;
    }
    $('#utilitiesTable').html(tables);
}