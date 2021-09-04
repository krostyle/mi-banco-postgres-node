const { insertTransaction, queryTables } = require("./controllers/banco.controllers");

const [action, ...args] = process.argv.slice(2);

const actions = {
    transaccion: insertTransaction,
    transacciones: queryTables,
    saldo: queryTables
}


const main = async() => {
    if (actions[action]) {
        switch (args.length) {
            case 1:
                if (action === 'transacciones') {
                    const res = await queryTables('transacciones', args);
                    console.log(res);
                } else {
                    const res = await queryTables('cuentas', args);
                    console.log(res);
                }
                break;
            case 4:
                const { resTransaccion } = await insertTransaction(args)
                console.log(resTransaccion.rows[0]);
                break;
        }
    } else {
        console.log("Acción no reconocida");
    }
}

main();