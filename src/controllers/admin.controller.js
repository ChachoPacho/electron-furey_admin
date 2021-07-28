const {
    getConnection
} = require('../database');
const {
    v4
} = require('uuid');

class ADMIN {
    static objects = {
        create: {
            table: 'this.#createTable()',
            col: 'this.#createCol()',
            rel: 'this.#createRel()'
        },
        update: {
            util: 'this.#updateUtil()',
            col: 'this.#updateCol()',
            rel: 'this.#updateRel()'
        }
    }
    static regexID = /(?<=\{)\d+(?=\})/g;
    static regexUP = /(?<=\+\%\{)\d+(?=\})/g;
    static regexDOWN = /(?<=\-\%\{)\d+(?=\})/g;

    static simple_RegexUP = /(?<=\+\%)\d+/g;
    static simple_RegexDOWN = /(?<=\-\%)\d+/g;

    constructor(tableName="", extra) {
        this.extra = extra;
        this.DB = getConnection().get('tables');
        //FULL ADMIN PETITIONS
        this.tablesAdmin = getConnection().get('admin.tables');

        this.tableName = tableName.toLowerCase();
        this.tableAdmin = (this.tableName) ? this.tablesAdmin.get(this.tableName) : '';

        //FULL TABLE OBJECTS PETITIONS
        this.table = this.DB.get(this.tableName);
    }

    //CONFIG INFORMATION
    get data() {
        let configData;

        if (this.tableAdmin) {
            configData = this.tableAdmin.value();
        } else {
            configData = this.tablesAdmin.value();
        }

        return configData;
    }

    //CUD OBJECTS
    #createCol() {
        //AÑADE LA COLUMNA EN LA POSICIÓN DADA, EN ADMIN.TABLES
        const newStructure = this.tableAdmin.value();
        const id = v4();
        (this.extra.afterof === "check") ? newStructure.__SHOW.unshift(id) : newStructure.__SHOW.splice(newStructure.__SHOW.indexOf(this.extra.afterof) + 1, 0, id);
        newStructure.__ALL[id] = this.extra.name.toLowerCase();
        newStructure.__COL.push(id);
        this.tableAdmin.assign(newStructure).write();
    }
    #createRel() {
        //AÑADE LA RELACIÓN
        this.extra.function = this.extra.function
            .replaceAll(" ", "")
            .replaceAll("\n", "")
            .replaceAll("\r", "")
            .replaceAll("&nbsp;", "");
        let ids = (this.extra.function.match(ADMIN.regexID) || []);
        let ups = (this.extra.function.match(ADMIN.regexUP) || []);
        let downs = (this.extra.function.match(ADMIN.regexDOWN) || []);
        let __ALL = Object.keys(this.tableAdmin.value().__ALL);

        let replace;
        let fun;

        for (const id of ids) {
            replace = "";
            fun = "(";
            if (ups.includes(String(id))) {
                replace = "+%";
                fun = "*(1+(1/100)*"
            } else if (downs.includes(String(id))) {
                replace = "-%";
                fun = "*(1-(1/100)*"
            }
            this.extra.function = this.extra.function.replace(`${replace}{${id}}`, `${fun}ELEM["${__ALL[id]}"])`);
        }

        ups = (this.extra.function.match(ADMIN.simple_RegexUP) || []);
        ups.forEach(e => {this.extra.function = this.extra.function.replace(`+%${e}`, `*(1+(1/100)*${e})`)})

        downs = (this.extra.function.match(ADMIN.simple_RegexDOWN) || []);
        downs.forEach(e => {this.extra.function = this.extra.function.replace(`-%${e}`, `*(1-(1/100)*${e})`)})

        const id = v4();
        this.tableAdmin.get('__REL').assign({[id]: this.extra.function.replace("%", "*(1/100)*")}).write();
        this.tableAdmin.get('__ALL').assign({[id]: this.extra.name}).write();
        this.tableAdmin.get('__SHOW').push(id).write();
        //( ( {1} * 0.5 ) - {2} ) +% 21
    }

    #createTable() {
        this.DB.set(this.tableName, []).write();
        this.tablesAdmin.set(this.tableName, {
            __SHOW: [],
            __ALL: {},
            __COL: [],
            __CAT: [],
            __REL: {}
        }).write();
    }

    setObject() {
        eval(ADMIN.objects.create[this.extra.objtype]);
    }

    #updateUtil() {
        const __ALL = Object.keys(this.tableAdmin.value().__ALL);
        const newShow = [];
        for (let index in __ALL) {
            let pos = parseInt(this.extra.pos[index]) - 1;
            if (pos == -1) continue;

            let element = __ALL[index];
            (newShow[pos]) ? newShow.splice(pos + 1, 0, element): newShow[pos] = element;
        }
        this.tableAdmin.set('__SHOW', newShow.filter(Boolean)).write();
    }

    async #updateCol() {
        this.tableAdmin.get('__ALL').assign({[this.extra.origin]: this.extra.name}).write();
    }

    reSetObject() {
        eval(ADMIN.objects.update[this.extra.objtype]);
    }

    removeObject() {
        if (this.extra.full) {
            this.DB.unset(this.tableName).write();

            this.tablesAdmin.unset(this.tableName).write();
        } else {
            if (this.extra.col) {
                for (const col of this.extra.col) {
                    for (const id of this.table.map("id").value()) {
                        this.table.find({
                            id
                        }).unset(col).write();
                    }
                    this.tableAdmin.get('__SHOW').pull(col).write();
                    this.tableAdmin.get('__COL').pull(col).write();
                    this.tableAdmin.unset('__ALL.' + col).write();
                }
            }
            if (this.extra.rel) {

            }
        }
    }

};


module.exports = ADMIN