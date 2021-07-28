const filterSearch = (data) => {
    let search = $('#webSearch').val() || $('#mobileSearch').val();
    if (!search) return data;
    
    let filter = []
    let regex = '';
    for (const letter of search.toLowerCase()) {
        regex += letter + '\\w*'
    }
    search = new RegExp(regex, 'g')
    for (const element of data) {
        for (const field in element) {
            if (field == 'id') continue;
            ( search.test( element[field].toString().toLowerCase() ) ) ? filter.push(element) : '' ;
        };
    }
    return filter
}

const orderBy = async (namespace, type) => {
    fillTBodyTable({
        orderby: [namespace, type]
    });
};

$('.navbar-search').submit(e => {
    e.preventDefault();
    fillTBodyTable();
})