const {
    getConnection
} = require('../database');
const {
    v4
} = require('uuid');

class TABLES {
    constructor(tableName="", extra={}) {
        this.DB = getConnection().get('tables');
        this.extra = extra;

        //FULL TABLE OBJECTS PETITIONS
        this.tableName = tableName.toLowerCase();
        this.table = (this.tableName) ? this.DB.get(this.tableName) : '';
    }

    //READ METHODS
    get data() {
        let response = this.table;
        if (this.extra.search) {
            response = this.table.find({
                [this.extra.search[0]]: this.extra.search[1]
            });
        } else if (this.extra.filter) response = this.table.filter(this.extra.filter);

        response = (this.extra.orderby) ? response.orderBy(this.extra.orderby[0], this.extra.orderby[1]) : response;

        return response.value();
    }

    #parseBody() {
        console.log(this.extra);
        for (const key in this.extra) {
            if (!this.extra[key]) {
                delete this.extra[key];
                continue
            };
            if ((Array.isArray(this.extra[key]) || typeof this.extra[key] === 'string') && key === 'id') continue;
            if (this.extra[key] instanceof Object) {
                for (const index in this.extra[key]) {
                    let element = this.extra[key][index].replace(',', '.');
                    this.extra[key][index] = !element ? element : isNaN(element) ? element : parseFloat(element);
                }
            } else {
                let element = this.extra[key].replace(',', '.');
                this.extra[key] = !element ? this.extra[key] : isNaN(element) ? element : parseFloat(element);
            }
        }
        console.log(this.extra)
    }

    #relPerm(res) {
        switch (this.extra.operation) {
            case 'sum':
                res += this.extra.cantidad;
                break;
            case 'min':
                res -= this.extra.cantidad;
                break;
            case 'up':
                res *= 1 + this.extra.cantidad / 100;
                break;
            case 'down':
                res *= 1 - this.extra.cantidad / 100;
                break;
            case 'percent':
                res *= this.extra.cantidad / 100;
                break;
            default:
                break;
        }
        return res
    }

    //CREATE/UPDATE ELEMENTS
    setElement() {
        this.#parseBody()
        if (this.extra.id) {
            if (this.extra.target !== "col" || this.extra.id.length > 1) {
                for (let id in this.extra.id) {
                    id = (Array.isArray(this.extra.id)) ? this.extra.id[id] : id;
                    let elem = this.table.find({id});

                    if (this.extra.target === "fun") {
                        // MODIFICA SOLO UNA COLUMNA DE UN ELEMENTO DE LA DB APLICANDO UNA FUNCIÓN
                        for (let col of this.extra.col) {                        
                            elem.assign({[col]: this.#relPerm(elem.get(col).value())}).write();
                        }
                    } else {
                        // MODIFICA SOLO UNA COLUMNA DE UN ELEMENTO DE LA DB
                        for (let col in this.extra) {
                            if (['id', 'target'].includes(col)) continue;
                            elem.assign({[col]: this.extra[col]}).write();
                        }
                    }
                }
            } else {
                // MODIFICA COMPLETAMENTE UN ELEMENTO DE LA DB
                this.extra.id = this.extra.id[0];
                delete this.extra.target;
                this.table.find({id: this.extra.id}).assign(this.extra).write()
            };
        } else {
            // CREA UN NUEVO ELEMENTO EN DB
            this.extra.id = v4();
            (this.table.value()) ? this.table.push(this.extra).write(): this.DB.set(this.tableName, [this.extra]).write();
        }
        return this.table.find({ id: this.extra.id }).value()
    }

    //DELETE ELEMENTS
    removeElements() {
        for (const id of this.extra.ids) this.table.remove({id}).write();
    }
}


module.exports = TABLES