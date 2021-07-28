const getChecked = (all=false) => {
  let ids = [];
  const checkeds = $("td > input[type=checkbox]:checked").parents('tr');
  checkeds.each(function () { ids.push($(this).attr('id')) });
  return { ids, items: checkeds };
}

const setChecked = (ids) => {
  for (const id of ids) {
    $('#' + id).find("input[type=checkbox]").attr("checked", 'true');
  }
}