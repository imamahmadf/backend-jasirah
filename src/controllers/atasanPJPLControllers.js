const {
  sequelize,
  pegawai,
  golongan,
  pangkat,
  daftarTingkatan,
  daftarGolongan,
  daftarPangkat,
  daftarUnitKerja,
  dalamKota,
  kontrakPJPL,
  kinerjaPJPL,
  indikatorPejabat,
  pejabatVerifikator,
} = require("../models");

const { Op } = require("sequelize");

module.exports = {
  getKontrakPegawai: async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = limit * (page - 1);
    const pegawaiId = req.query.pegawaiId; // pegawaiId dari pejabatVerifikator
    const unitKerjaId = req.query.unitKerjaId; // unitKerjaId dari pejabatVerifikator
    const kontrakPegawaiId = req.query.kontrakPegawaiId; // pegawaiId dari kontrakPJPL
    const tanggalAwal = req.query.tanggalAwal;
    const tanggalAkhir = req.query.tanggalAkhir;

    try {
      // Validasi pegawaiId (pejabatVerifikator)
      if (!pegawaiId) {
        return res.status(400).json({
          error: "pegawaiId harus diisi",
        });
      }

      // Build kondisi WHERE untuk raw query
      const rawWhereConditions = ["pv.pegawaiId = :pegawaiId"];
      const replacements = { pegawaiId };

      // Filter unitKerjaId
      if (unitKerjaId) {
        rawWhereConditions.push("pv.unitKerjaId = :unitKerjaId");
        replacements.unitKerjaId = unitKerjaId;
      }

      // Dapatkan ID kontrakPJPL yang valid terlebih dahulu menggunakan raw query
      const { QueryTypes } = require("sequelize");
      const validKontrakIds = await sequelize.query(
        `
        SELECT DISTINCT kp.kontrakPJPLId
        FROM kinerjaPJPLs kp
        INNER JOIN indikatorPejabats ip ON kp.indikatorPejabatId = ip.id
        INNER JOIN pejabatVerifikators pv ON ip.pejabatVerifikatorId = pv.id
        WHERE ${rawWhereConditions.join(" AND ")}
        `,
        {
          replacements,
          type: QueryTypes.SELECT,
        }
      );

      const kontrakIds = validKontrakIds.map((item) => item.kontrakPJPLId);

      if (kontrakIds.length === 0) {
        return res.status(200).json({
          success: true,
          result: [],
          page,
          limit,
          totalRows: 0,
          totalPage: 0,
        });
      }

      // Setup include untuk data lengkap
      const includeOptions = [
        {
          model: kinerjaPJPL,
          attributes: ["id", "indikator", "target", "status"],
          include: [
            {
              model: indikatorPejabat,
              as: "indikatorPejabat",
              attributes: ["id", "indikator"],
              include: [
                {
                  model: pejabatVerifikator,
                  attributes: ["id", "pegawaiId", "unitKerjaId"],
                  include: [
                    {
                      model: pegawai,
                      attributes: ["id", "nama", "nip", "jabatan"],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: pegawai,
          attributes: ["id", "nama", "nip", "jabatan"],
        },
      ];

      // Build where clause untuk kontrakPJPL
      const whereConditions = [
        {
          id: {
            [Op.in]: kontrakIds,
          },
        },
      ];

      // Filter pegawaiId dari kontrakPJPL
      if (kontrakPegawaiId) {
        whereConditions.push({
          pegawaiId: kontrakPegawaiId,
        });
      }

      // Filter tanggalAwal dan tanggalAkhir
      // Filter: kontrak yang tanggalnya overlap dengan range yang diberikan
      if (tanggalAwal || tanggalAkhir) {
        if (tanggalAwal && tanggalAkhir) {
          // Kontrak yang overlap dengan range tanggalAwal - tanggalAkhir
          // Kontrak overlap jika: kontrak.tanggalAwal <= filter.tanggalAkhir AND kontrak.tanggalAkhir >= filter.tanggalAwal
          whereConditions.push({
            [Op.and]: [
              { tanggalAwal: { [Op.lte]: new Date(tanggalAkhir) } },
              { tanggalAkhir: { [Op.gte]: new Date(tanggalAwal) } },
            ],
          });
        } else if (tanggalAwal) {
          // Kontrak yang tanggalAkhir >= tanggalAwal (kontrak masih aktif atau baru dimulai setelah tanggalAwal)
          whereConditions.push({
            tanggalAkhir: { [Op.gte]: new Date(tanggalAwal) },
          });
        } else if (tanggalAkhir) {
          // Kontrak yang tanggalAwal <= tanggalAkhir (kontrak dimulai sebelum atau pada tanggalAkhir)
          whereConditions.push({
            tanggalAwal: { [Op.lte]: new Date(tanggalAkhir) },
          });
        }
      }

      const whereClause = {
        [Op.and]: whereConditions,
      };

      // Get data dengan pagination
      const result = await kontrakPJPL.findAll({
        limit,
        offset,
        where: whereClause,
        attributes: [
          "id",
          "pegawaiId",
          "tanggalAwal",
          "tanggalAkhir",
          "createdAt",
          "updatedAt",
        ],
        include: includeOptions,
        order: [["createdAt", "DESC"]],
      });

      // Count total rows
      const totalRows = await kontrakPJPL.count({
        where: whereClause,
      });

      const totalPage = Math.ceil(totalRows / limit);

      return res.status(200).json({
        success: true,
        result,
        page,
        limit,
        totalRows,
        totalPage,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
};
