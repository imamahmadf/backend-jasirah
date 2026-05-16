const {
    rincianBPD,
    rill,
    daftarUnitKerja,
    sequelize,
    user,
    userRole,
    role,
    profile,
    templateBPD,
    templateRill,
    personil
  } = require("../models");
  
  const { Op } = require("sequelize");
  
  module.exports = {
    getTemplateBPD: async (req, res) => {
        const id = parseInt(req.params.id);
        try {
          if (!id || isNaN(id)) {
            return res.status(400).json({
              message: "ID unit kerja tidak valid",
              code: 400,
            });
          }

          const result = await templateBPD.findAll({
            include: [
              { model: templateRill },
            ],
            where: {
              unitKerjaId: id
            },
            order: [["id", "DESC"]]
          });
    
          return res.status(200).json({ result });
        } catch (err) {
          return res.status(500).json({
            message: err.toString(),
            code: 500,
          });
        }
      },

    postTemplateBPD: async (req, res) => {
      const { namaKota, uangHarian, status, unitKerjaId, templateRills } = req.body;
      
      // Validasi input
      if (!namaKota || !namaKota.trim()) {
        return res.status(400).json({
          message: "Nama kota wajib diisi",
          code: 400,
        });
      }

      if (!uangHarian || uangHarian <= 0) {
        return res.status(400).json({
          message: "Uang harian harus lebih dari 0",
          code: 400,
        });
      }

      if (!status || !["aktif", "nonaktif"].includes(status)) {
        return res.status(400).json({
          message: "Status harus aktif atau nonaktif",
          code: 400,
        });
      }

      if (!unitKerjaId) {
        return res.status(400).json({
          message: "Unit kerja ID wajib diisi",
          code: 400,
        });
      }

      if (!templateRills || !Array.isArray(templateRills) || templateRills.length === 0) {
        return res.status(400).json({
          message: "Minimal harus ada 1 template Rill dengan uraian",
          code: 400,
        });
      }

      // Filter templateRill yang valid (minimal ada uraian)
      const validRills = templateRills.filter((rill) => rill.uraian && rill.uraian.trim());

      if (validRills.length === 0) {
        return res.status(400).json({
          message: "Minimal harus ada 1 template Rill dengan uraian",
          code: 400,
        });
      }

      const transaction = await sequelize.transaction();
      
      try {
        // Buat templateBPD
        const newTemplateBPD = await templateBPD.create(
          {
            namaKota: namaKota.trim(),
            uangHarian: parseInt(uangHarian),
            status: status,
            unitKerjaId: parseInt(unitKerjaId),
          },
          { transaction }
        );

        // Siapkan data templateRills
        const templateRillsData = validRills.map((rill) => ({
          templateBPDId: newTemplateBPD.id,
          uraian: rill.uraian.trim(),
          nilai: parseInt(rill.nilai) || 0,
        }));

        // Buat templateRills
        const createdTemplateRills = await templateRill.bulkCreate(
          templateRillsData,
          { transaction }
        );

        // Commit transaction
        await transaction.commit();

        // Ambil data lengkap dengan include
        const result = await templateBPD.findByPk(newTemplateBPD.id, {
          include: [{ model: templateRill }],
        });

        return res.status(201).json({
          message: "Template BPD berhasil ditambahkan",
          result: result,
        });
      } catch (err) {
        // Rollback transaction jika ada error
        await transaction.rollback();
        console.error("Error postTemplateBPD:", err);
        return res.status(500).json({
          message: err.message || "Gagal menambahkan template BPD",
          code: 500,
        });
      }
    },

    updateTemplateBPD: async (req, res) => {
      const id = parseInt(req.params.id);
      const { namaKota, uangHarian, status, unitKerjaId, templateRills } = req.body;
      
      // Validasi ID
      if (!id || isNaN(id)) {
        return res.status(400).json({
          message: "ID template BPD tidak valid",
          code: 400,
        });
      }

      // Validasi input
      if (!namaKota || !namaKota.trim()) {
        return res.status(400).json({
          message: "Nama kota wajib diisi",
          code: 400,
        });
      }

      if (!uangHarian || uangHarian <= 0) {
        return res.status(400).json({
          message: "Uang harian harus lebih dari 0",
          code: 400,
        });
      }

      if (!status || !["aktif", "nonaktif"].includes(status)) {
        return res.status(400).json({
          message: "Status harus aktif atau nonaktif",
          code: 400,
        });
      }

      if (!unitKerjaId) {
        return res.status(400).json({
          message: "Unit kerja ID wajib diisi",
          code: 400,
        });
      }

      if (!templateRills || !Array.isArray(templateRills) || templateRills.length === 0) {
        return res.status(400).json({
          message: "Minimal harus ada 1 template Rill dengan uraian",
          code: 400,
        });
      }

      // Filter templateRill yang valid (minimal ada uraian)
      const validRills = templateRills.filter((rill) => rill.uraian && rill.uraian.trim());

      if (validRills.length === 0) {
        return res.status(400).json({
          message: "Minimal harus ada 1 template Rill dengan uraian",
          code: 400,
        });
      }

      const transaction = await sequelize.transaction();
      
      try {
        // Cek apakah templateBPD ada
        const existingTemplateBPD = await templateBPD.findByPk(id, { transaction });
        
        if (!existingTemplateBPD) {
          await transaction.rollback();
          return res.status(404).json({
            message: "Template BPD tidak ditemukan",
            code: 404,
          });
        }

        // Update templateBPD
        await templateBPD.update(
          {
            namaKota: namaKota.trim(),
            uangHarian: parseInt(uangHarian),
            status: status,
            unitKerjaId: parseInt(unitKerjaId),
          },
          { 
            where: { id: id },
            transaction 
          }
        );

        // Hapus semua templateRills yang lama
        await templateRill.destroy({
          where: { templateBPDId: id },
          transaction
        });

        // Siapkan data templateRills baru
        const templateRillsData = validRills.map((rill) => ({
          templateBPDId: id,
          uraian: rill.uraian.trim(),
          nilai: parseInt(rill.nilai) || 0,
        }));

        // Buat templateRills baru
        await templateRill.bulkCreate(
          templateRillsData,
          { transaction }
        );

        // Commit transaction
        await transaction.commit();

        // Ambil data lengkap dengan include
        const result = await templateBPD.findByPk(id, {
          include: [{ model: templateRill }],
        });

        return res.status(200).json({
          message: "Template BPD berhasil diupdate",
          result: result,
        });
      } catch (err) {
        // Rollback transaction jika ada error
        await transaction.rollback();
        console.error("Error updateTemplateBPD:", err);
        return res.status(500).json({
          message: err.message || "Gagal mengupdate template BPD",
          code: 500,
        });
      }
    },

    updateStatusTemplateBPD: async (req, res) => {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      // Validasi ID
      if (!id || isNaN(id)) {
        return res.status(400).json({
          message: "ID template BPD tidak valid",
          code: 400,
        });
      }

      // Validasi status
      if (!status || !["aktif", "nonaktif"].includes(status)) {
        return res.status(400).json({
          message: "Status harus aktif atau nonaktif",
          code: 400,
        });
      }

      try {
        // Cek apakah templateBPD ada
        const existingTemplateBPD = await templateBPD.findByPk(id);
        
        if (!existingTemplateBPD) {
          return res.status(404).json({
            message: "Template BPD tidak ditemukan",
            code: 404,
          });
        }

        // Update hanya status
        await templateBPD.update(
          { status: status },
          { where: { id: id } }
        );

        // Ambil data yang sudah diupdate
        const result = await templateBPD.findByPk(id, {
          include: [
            { model: templateRill },
            {
              model: daftarUnitKerja,
              attributes: ["id", "unitKerja", "kode", "asal"],
            }
          ],
        });

        return res.status(200).json({
          message: "Status template BPD berhasil diupdate",
          result: result,
        });
      } catch (err) {
        console.error("Error updateStatusTemplateBPD:", err);
        return res.status(500).json({
          message: err.message || "Gagal mengupdate status template BPD",
          code: 500,
        });
      }
    },

    getAllTemplateBPD: async (req, res) => {
      try {
        // Pagination parameters
        const page = parseInt(req.query.page) || 0;
        const limit = parseInt(req.query.limit) || 50;
        const offset = limit * page;

        // Filter parameters
        const unitKerjaId = req.query.unitKerjaId ? parseInt(req.query.unitKerjaId) : null;
        const status = req.query.status;

        // Build where condition
        const whereCondition = {};
        if (unitKerjaId && !isNaN(unitKerjaId)) {
          whereCondition.unitKerjaId = unitKerjaId;
        }
        if (status && ["aktif", "nonaktif"].includes(status)) {
          whereCondition.status = status;
        }

        // Get data with pagination
        const result = await templateBPD.findAll({
          include: [
            { model: templateRill },
            {
              model: daftarUnitKerja,
              attributes: ["id", "unitKerja", "kode", "asal"],
            }
          ],
          where: whereCondition,
          order: [["id", "DESC"]],
          limit,
          offset,
        });

        // Get total rows for pagination info
        const totalRows = await templateBPD.count({
          where: whereCondition,
        });
        const totalPage = Math.ceil(totalRows / limit);

        return res.status(200).json({
          result,
          page,
          limit,
          totalRows,
          totalPage,
        });
      } catch (err) {
        console.error("Error getAllTemplateBPD:", err);
        return res.status(500).json({
          message: err.toString(),
          code: 500,
        });
      }
    },

    searchTemplateBPD: async (req, res) => {
      try {
        const { q } = req.query;
        const unitKerjaId = parseInt(req.query.unitKerjaId);

        // Validasi unitKerjaId wajib ada
        if (!unitKerjaId || isNaN(unitKerjaId)) {
          return res.status(400).json({
            message: "Unit kerja ID wajib diisi",
            code: 400,
          });
        }

        // Build where condition
 

        const result = await templateBPD.findAll({
          where: {
            unitKerjaId
          },
          include: [
            { model: templateRill },
            {
              model: daftarUnitKerja,
              attributes: ["id", "unitKerja", "kode", "asal"],
            }
          ],
          attributes: [
            "id",
            "namaKota",
            "uangHarian",
            "status",
            "unitKerjaId",
          ],
          limit: 10,
          order: [["namaKota", "ASC"]],
        });

        res.status(200).json({ result });
      } catch (err) {
        res.status(500).json({ message: err.toString(), code: 500 });
      }
    },

    applyTemplateBPD: async (req, res) => {
      const transaction = await sequelize.transaction();
      const {
        perjalananId,
        templateBPDId,
        namaKota,
        uangHarian,
        unitKerjaId,
        tanggalBerangkat,
        tanggalPulang,
        templateRill: templateRillData,
        personilIds,
      } = req.body;

      // Validasi input
      if (!personilIds || !Array.isArray(personilIds) || personilIds.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          message: "personilIds harus berupa array dan tidak boleh kosong",
          code: 400,
        });
      }

      if (!templateBPDId) {
        await transaction.rollback();
        return res.status(400).json({
          message: "templateBPDId wajib diisi",
          code: 400,
        });
      }

      if (!templateRillData || !Array.isArray(templateRillData) || templateRillData.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          message: "templateRill harus berupa array dan tidak boleh kosong",
          code: 400,
        });
      }

      console.log(req.body, "APPLY TEMPLATE BPD");

      try {
        const results = [];

        // Hitung jumlah hari dari tanggalBerangkat dan tanggalPulang
        let jumlahHari = 1;
        if (tanggalBerangkat && tanggalPulang) {
          const tglBerangkat = new Date(tanggalBerangkat);
          const tglPulang = new Date(tanggalPulang);
          const diffTime = Math.abs(tglPulang - tglBerangkat);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          jumlahHari = diffDays + 1; // +1 karena hari berangkat dan pulang dihitung
        }

        // Hitung total nilai dari templateRill
        const totalRillNilai = templateRillData.reduce((sum, r) => sum + (parseInt(r.nilai) || 0), 0);

        // Hitung nilai uang harian total (per hari * jumlah hari)
        const uangHarianPerHari = parseInt(uangHarian) || 0;
        const totalUangHarian = uangHarianPerHari * jumlahHari;

        // Loop untuk setiap personil
        for (const personilId of personilIds) {
          // Validasi personilId
          if (!personilId) {
            throw new Error(`personilId tidak valid`);
          }

          // Buat rincianBPD untuk uang harian
          await rincianBPD.create(
            {
              personilId,
              item: "Uang harian",
              nilai: uangHarianPerHari,
              jenisId: 1,
              qty: jumlahHari,
              satuan: "OH",
            },
            { transaction }
          );

          // Buat rincianBPD untuk pengeluaran rill
          const rillBPD = await rincianBPD.create(
            {
              personilId,
              item: "Pengeluaran Rill",
              nilai: totalRillNilai,
              jenisId: 5,
              qty: 1,
              satuan: "-",
            },
            { transaction }
          );

          // Buat detail rill untuk setiap item dari templateRill
          for (const rillItem of templateRillData) {
            await rill.create(
              {
                rincianBPDId: rillBPD.id,
                item: rillItem.uraian,
                nilai: parseInt(rillItem.nilai) || 0,
              },
              { transaction }
            );
          }

          // Hitung total (uang harian total + total rill)
          const totalPersonil = totalUangHarian + totalRillNilai;

          // Update total personil
          await personil.update(
            {
              total: totalPersonil,
            },
            {
              where: { id: personilId },
              transaction,
            }
          );

          results.push({
            personilId,
            total: totalPersonil,
            success: true,
          });
        }

        await transaction.commit();
        return res.status(200).json({
          message: `Template BPD "${namaKota}" berhasil diterapkan ke ${results.length} personil`,
          data: results,
          totalPersonil: results.length,
        });
      } catch (err) {
        await transaction.rollback();
        console.error("Error applyTemplateBPD:", err);
        return res.status(500).json({
          message: err.toString(),
          code: 500,
        });
      }
    },

  };
  