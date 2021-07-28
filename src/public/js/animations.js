const modifyElements = async () => {
    const elementsChecked = $("td > input[type=checkbox]:checked");
    
    if (elementsChecked.length > 1) {
        $('#modifyContentONE').hide();
        $('#modifyContentALL').show();
        $('#modifyModalDialog').addClass('modal-xl');
    } else {
        $('#modifyContentONE').show();
        $('#modifyContentALL').hide();
        $('#modifyModalDialog').removeClass('modal-xl');
        
        let id = elementsChecked.parents('tr').attr('id');

        sendRequest("clientPOST", {
            apiTarget: ["tables", "admin"]
        },
        { 
            search: ["id", id]
        },
        {
            target: "updateModifyForm",
            id,
        })
    }
}

const tr_animate = () => {
    $('tbody tr').click(e => {
        $('.selected_tr').removeClass('selected_tr').prev().removeClass('brother_selected_tr');
        $(e.currentTarget).addClass('selected_tr').prev().addClass('brother_selected_tr');
    })
};

const td_animate = (admin) => {
    function updateWithFocusOut(elementHTML) {
        let newValue = elementHTML.children()[0].value;
        let entryID = [elementHTML.html(newValue).parents('tr').attr('id')];
        let col = admin.__SHOW[elementHTML.index() - 1];
        
        sendRequest("SET", { apiTarget: "tables" },{ id: entryID, [col]: newValue });
        sendRequest("clientPOST", {
            apiTarget: ["tables"]
        },
        { 
            search: ["id", entryID[0]]
        },
        {
            target: "fillRelateds",
            admin,
            HTMLPATH: elementHTML.getSelector(true)
        }) 
    }

    function updateWithClicking(elementJQUERY) {
        elementJQUERY.off().on("dblclick focusout keydown", e => {
            let elementHTML = $(e.currentTarget);
            if (e.type === "dblclick" && !elementHTML.children().length) {
                elementHTML.html(`<input type="text" value="${elementHTML.html()}">`).children()[0].focus();
    
            } else if (e.type === "focusout") {
                updateWithFocusOut(elementHTML)
    
            } else if (e.type === "keydown" && e.keyCode === 13) {
                elementHTML.off();
                updateWithFocusOut(elementHTML);
                updateWithClicking(elementHTML);
            }
        })
    }

    updateWithClicking($('tbody > tr > td:not(:first-child):not([related])'));
}

const checkAlmostOne_animate = () => {
    if ($("td > input[type=checkbox]:checked").length == 0)  {
        $('.btnBlock').addClass('disabled');
        $('.contApply').hide();
        $('.contDeny').show();
    } else {
        $('.btnBlock').removeClass('disabled');
        $('.contApply').show();
        $('.contDeny').hide();
    };
};

const check_animate = () => {
    const allCheckBox = $("td > input[type=checkbox]");

    $("#checkALL").on("click", function () {
        allCheckBox.prop("checked", this.checked)
        checkAlmostOne_animate();
    });

    allCheckBox.on("click", function () {
        $("#checkALL").prop("checked", (allCheckBox.length == $("td > input[type=checkbox]:checked").length));
        checkAlmostOne_animate();
    });

    checkAlmostOne_animate();
}

const check_del_animate = () => {
    const allCheckBox = $("#deleteCheckBoxCol input[type=checkbox]");

    $("#deleteCheckItemFull").on("click", function () {
        allCheckBox.prop("checked", this.checked)
    });

    allCheckBox.on("click", function () {
        $("#deleteCheckItemFull").prop("checked", (allCheckBox.length == $("#deleteCheckBoxCol input[type=checkbox]:checked").length));
    });
}

const table_animate = (admin) => {
    td_animate(admin);
    tr_animate();
    check_animate();
    check_del_animate();
}