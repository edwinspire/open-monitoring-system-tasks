const soap = require("soap");
const fetch = require("node-fetch");
const aut = require("./private/fn_oms_authentication");

// Obtiene el estado de los documentos Electrónicos
module.exports = async function F(idtask, params) {
  return new Promise(async function (resolve, reject) {
    try {
      var docs = await ObtenerDocumentosParaConsultar(params);
      //console.debug('Documentos por consultar', docs);

      if (docs && Array.isArray(docs)) {
        let docstatus = await ObtenerEstadoDocumentos(params, docs);
        //console.debug('Documentos nuevos estados', docstatus);
        let update_docs = await ActualizarEstadoDocumentos(params, docstatus);
        console.log("Retorno api", update_docs);
        resolve(true);
      } else {
        resolve(true);
      }
    } catch (err) {
      reject(err);
    }
  });
};

function ObtenerEstadoDocumentos(params, lista_docs) {
  return new Promise(async function (resolve, reject) {
    try {
      soap.createClient(params.url, (err1, client) => {
        if (err1) {
          reject(err1);
        } else {
          let series = [];

          if (lista_docs && Array.isArray(lista_docs)) {
            series = lista_docs.map((d) => {
              return {
                string: d.serie_documento,
              };
            });
          }

          var args = {
            serie_documentos: series,
            sucursal: "002",
          };

          client.EstadoDocumentoElectronico(args, (err2, result) => {
            if (err2) {
              reject(err2);
            } else {
              if (result && result.EstadoDocumentoElectronicoResult) {
                resolve(result.EstadoDocumentoElectronicoResult);
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
async function ObtenerDocumentosParaConsultar(params) {
  //console.log(params);
  try {
    let result = await fetch(
      params.url_pgapi_getdocs +
        "?iddivision=" +
        params.iddivision +
        "&solo_serie_documento=true",
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
async function ActualizarEstadoDocumentos(params, docs) {
  //console.trace(docs.length);
  let data = JSON.stringify(docs);
  //console.trace(data);
  try {
    let result = await fetch(params.docs_update_status, {
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
