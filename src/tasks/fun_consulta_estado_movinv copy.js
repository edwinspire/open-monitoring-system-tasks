const soap = require("soap");
const fetch = require("node-fetch");
const aut = require("./private/fn_oms_authentication");

module.exports = async function F(idtask, params) {
  return new Promise(async function (resolve, reject) {
    try {
      var movinvs = await ObtenerMovInvPendientes(params);
      //console.debug("Documentos por consultar", movinvs.length);
      let proms = [];

      if (movinvs) {
        //console.log("movinvs.length");
        movinvs.forEach((element) => {
          let prom = ObtenerEstadoMovInv(params, element).then((status) => {
            //  console.log("=>", status);
            return ActualizarEstadoMovInv(params, status);
          });
          proms.push(prom);
        });
      }
      //console.debug("Conexiones por consultar", proms.length);
      Promise.all(proms)
        .then((values) => {
          //  console.log(values);
          resolve(values);
        })
        .catch((reason) => {
          //console.log(reason);
          reject(reason);
        });
    } catch (err) {
      reject(err);
    }
  });
};

function ObtenerEstadoMovInv(params, movinv) {
  return new Promise(function (resolve, reject) {
    try {
      //console.log("Conecta a WS...", movinv.idreginterfacesmatriz);
      soap.createClient(params.url, (err1, client) => {
        if (err1) {
          reject(err1);
        } else {
          // console.log(movinv);
          /*
        var Fecha_Vencimiento_Pago = movsap.cpudt+" "+movsap.cputm; *
        var cantidad = movsap.menge; *
        var numero_doc_inv = movsap.mblnr; *
        var ofi_codigo_interno_empresa = movsap.werks; *
        var tme_codigo_externo = movsap.bwart; *
        var codigo_producto = Number(movsap.matnr); *
        var tme_naturaleza_externo = movsap.shkzg;
*/
          var args = {
            ofi_codigo_interno_empresa: movinv.werks,
            codigo_producto: Number(movinv.matnr),
            tme_naturaleza_externo: movinv.shkzg,
            tme_codigo_externo: movinv.bwart,
            Fecha_Vencimiento_Pago: movinv.cpudt + " " + movinv.cputm,
            cantidad: movinv.menge,
            numero_doc_inv: movinv.mblnr,
          };

          //  console.log(args);

          client.EstadoMovimientoInventario(args, (err2, result) => {
            if (err2) {
              //    console.error(err2);
              reject(err2);
            } else {
              //    console.log(result);
              if (result && result.EstadoMovimientoInventarioResult) {
                result.idreginterfacesmatriz = movinv.idreginterfacesmatriz;
                result.isvalid = true;
                result.enmatriz = false;
                if (result.EstadoMovimientoInventarioResult.length == 1) {
                  result.enmatriz = true;
                } else if (result.EstadoMovimientoInventarioResult.length > 1) {
                  result.enmatriz = true;
                  result.isvalid = false;
                } else {
                  result.isvalid = false;
                }

                resolve(result);
              } else {
                resolve([]);
              }
            }
          });
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

// Obtener la lista de documentos a consultar, esto se obtiene por pgapi
async function ObtenerMovInvPendientes(params) {
  try {
    //console.log(params);
    let result = await fetch(
      params.url_pgapi_getmovinv +
        "?iddivision=" +
        params.iddivision +
        "&limit=" +
        params.limit,
      {
        method: "GET",
        //body: data,
        headers: {
          "Content-Type": "application/json",
          Authorization: aut(),
        },
      }
    );
    return await result.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

// Actualizar el estado de los documentos
async function ActualizarEstadoMovInv(params, movinv) {
  //console.trace(docs.length);
  let data = JSON.stringify(movinv);
  //console.trace(data);
  try {
    let result = await fetch(params.docs_update_movinv, {
      method: "POST",
      body: data,
      headers: {
        "Content-Type": "application/json",
        Authorization: aut(),
      },
    });
    return await result.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}
