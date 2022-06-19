"use strict";

module.exports = function (Avaliacao) {
  //get avaliações do colaborador pela data
  // (já existe "/colaboradors/{id}/avaliacoes",
  //só é necessário aplicar o filtro: {"where":{"dataHora": "2021-02-21T16:34:08.081Z"}})

  //insert pegar a data e a classificação no front
  //get ultima avaliação de cada colaborador (Array) (ok)

  Avaliacao.getUltimasAvaliacoes = async function () {
    return Avaliacao.aggregate({
      aggregate: [
        {
          $lookup: {
            from: "Colaborador",
            localField: "ColaboradorId",
            foreignField: "_id",
            as: "colaborador",
          },
        },
        {
          $unwind: {
            path: "$colaborador",
          },
        },
        {
          $sort: {
            dataHora: 1,
          },
        },
        {
          $group: {
            _id: "$ColaboradorId",
            dataUltima: {
              $max: "$dataHora",
            },
            pulso: {
              $last: "$pulso",
            },
            pSistolica: {
              $last: "$pSistolica",
            },
            pDiastolica: {
              $last: "$pDiastolica",
            },
            hipertensao: {
              $last: "$hipertensao",
            },
          },
        },
      ],
    })
      .then(function (avaliacoes) {
        return Promise.resolve(avaliacoes);
      })
      .catch(function (err) {
        console.log(err);
      });
  };

  Avaliacao.remoteMethod("getUltimasAvaliacoes", {
    description: "Retorna a última avaliação de todos os colaboradores",
    http: {
      path: "/ultimas",
      verb: "get",
    },
    returns: {
      type: [Avaliacao],
      root: true,
    },
  });

  Avaliacao.getResumoHipertensao = async function () {
    return Avaliacao.aggregate({
      aggregate: [
        {
          $lookup: {
            from: "Colaborador",
            localField: "ColaboradorId",
            foreignField: "_id",
            as: "colaborador",
          },
        },
        {
          $unwind: {
            path: "$colaborador",
          },
        },
        {
          $sort: {
            dataHora: 1,
          },
        },
        {
          $group: {
            _id: "$ColaboradorId",
            dataUltima: {
              $max: "$dataHora",
            },
            pulso: {
              $last: "$pulso",
            },
            pSistolica: {
              $last: "$pSistolica",
            },
            pDiastolica: {
              $last: "$pDiastolica",
            },
            hipertensao: {
              $last: "$hipertensao",
            },
          },
        },
        { $sortByCount: "$hipertensao" },
        {
          $project: {
            _id: 0,
            x: "$_id",
            y: "$count",
          },
        },
      ],
    })
      .then(function (res) {
        return Promise.resolve(res);
      })
      .catch(function (err) {
        console.log(err);
      });
  };

  Avaliacao.remoteMethod("getResumoHipertensao", {
    description:
      "Retorna o número de colaboradores por classificacao de hipertensao",
    http: {
      path: "/resumo/hipertensao",
      verb: "get",
    },
    returns: {
      type: [{}],
      root: true,
    },
  });

  Avaliacao.getNumAvaliacoes = async function () {
    return Avaliacao.aggregate({
      aggregate: [
        {
          $facet: {
            anual: [
              {
                $group: {
                  _id: { $dateFromParts: { year: { $year: "$dataHora" } } },
                  count: { $sum: 1 },
                },
              },
              { $sort: { _id: -1 } },
              { $limit: 10 },
              { $project: { _id: 0, x: { $year: "$_id" }, y: "$count" } },
            ],

            mensal: [
              {
                $group: {
                  _id: {
                    $dateFromParts: {
                      year: { $year: "$dataHora" },
                      month: { $month: "$dataHora" },
                    },
                  },
                  count: { $sum: 1 },
                },
              },
              { $sort: { _id: -1 } },
              { $limit: 12 },
              {
                $project: {
                  _id: 0,
                  x: {
                    $concat: [
                      { $toString: { $month: "$_id" } },
                      "-",
                      { $toString: { $dayOfMonth: "$_id" } },
                      "-",
                      { $toString: { $year: "$_id" } },
                      " GMT",
                    ],
                  },
                  y: "$count",
                },
              },
            ],

            diario: [
              {
                $group: {
                  _id: {
                    $dateFromParts: {
                      year: { $year: "$dataHora" },
                      month: { $month: "$dataHora" },
                      day: { $dayOfMonth: "$dataHora" },
                    },
                  },
                  count: { $sum: 1 },
                },
              },
              { $sort: { _id: -1 } },
              { $limit: 31 },
              {
                $project: {
                  _id: 0,
                  x: {
                    $concat: [
                      { $toString: { $month: "$_id" } },
                      "-",
                      { $toString: { $dayOfMonth: "$_id" } },
                      "-",
                      { $toString: { $year: "$_id" } },
                      " GMT",
                    ],
                  },
                  y: "$count",
                },
              },
            ],
          },
        },
      ],
    })
      .then(function (res) {
        return Promise.resolve(res);
      })
      .catch(function (err) {
        console.log(err);
      });
  };

  Avaliacao.remoteMethod("getNumAvaliacoes", {
    description:
      "Retorna o número de avaliacoes realizadas agrupadas por dia, mês e ano",
    http: {
      path: "/num/realizadas",
      verb: "get",
    },
    returns: {
      type: [{}],
      root: true,
    },
  });
};