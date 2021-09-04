const { Pool } = require('pg');
const Cursor = require('pg-cursor');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'banco',
    password: 'admin',
    port: 5432,
    min: 1,
    max: 20,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 2000
});


const queryTransaction = async(transaccion, saldo) => {
    return new Promise((resolve, reject) => {
        pool.connect(async(err, client, release) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            try {
                await client.query('BEGIN');
                const resTransaccion = await client.query(transaccion);
                const resSaldo = await client.query(saldo);
                await client.query('COMMIT');
                release();
                resolve({ resTransaccion, resSaldo });
            } catch (err) {
                console.log(err);
                await client.query('ROLLBACK');
                release();
            }
        });
        pool.end();
    })

};


const queryCursor = async(query) => {
    return new Promise((resolve, reject) => {
        pool.connect(async(err, client, release) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            try {
                const cursor = client.query(query);
                cursor.read(10, (err, rows) => {
                    if (err) return reject(err);
                    release();
                    resolve(rows);
                });
            } catch (err) {
                release();
                console.log(err);
                return reject(err);

            }
        });
        pool.end();
    })
}

const insertTransaction = async(values) => {
    try {
        const [descripcion, fecha, monto, id_cuenta] = values;
        const text = 'INSERT INTO transacciones(descripcion, fecha, monto, cuenta) VALUES($1, $2, $3, $4) RETURNING *';
        const objTransaction = {
            text,
            values
        };

        const increaseSaldo = 'UPDATE cuentas SET saldo = saldo + $1 WHERE id = $2';
        const objIncreaseSaldo = {
            text: increaseSaldo,
            values: [monto, id_cuenta]
        };
        const res = await queryTransaction(objTransaction, objIncreaseSaldo);
        return res;
    } catch (error) {
        console.log(error);
        return error;
    }

}

const queryTables = async(table, args) => {
    try {
        table === 'transacciones' ? campo = 'cuenta' : campo = 'id';
        const query = new Cursor(`SELECT * FROM ${table} WHERE ${campo}=$1`, args);
        const res = await queryCursor(query);
        return res;
    } catch (error) {
        console.log(error);
        return error;
    }

}


module.exports = {
    insertTransaction,
    queryTables,

};