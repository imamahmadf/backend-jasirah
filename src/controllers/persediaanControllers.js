const {
  tipePersediaan,
  persediaan,
  stokMasuk,
  stokKeluar,
  rinObPersediaan,
  obPersediaan,
  laporanPersediaan,
} = require("../models");

const { Op, fn, col, literal } = require("sequelize");

module.exports = {
  getAllPersediaan: async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const offset = limit * page;

    try {
      // 1. Ambil data persediaan dari DB lokal
      const result = await persediaan.findAll({
        limit,
        offset,
        include: [{ model: tipePersediaan }],
        order: [["id", "ASC"]],
      });

      const totalRows = await persediaan.count({
        limit,
        offset,
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
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data persediaan",
        error: err.toString(),
      });
    }
  },

  getAllObPersediaan: async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const offset = limit * page;

    try {
      // 1. Ambil data ob persediaan dari DB lokal
      const result = await obPersediaan.findAll({
        limit,
        offset,
        include: [
          {
            model: rinObPersediaan,
            include: [
              { model: tipePersediaan, include: [{ model: persediaan }] },
            ],
          },
        ],
        order: [["id", "ASC"]],
      });

      const totalRows = await obPersediaan.count({
        limit,
        offset,
        include: [
          {
            model: rinObPersediaan,
            include: [
              { model: tipePersediaan, include: [{ model: persediaan }] },
            ],
          },
        ],
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
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data ob persediaan",
        error: err.toString(),
      });
    }
  },

  getSeed: async (req, res) => {
    try {
      // 1. Ambil data kendaraan dari DB lokal
      const resultTipe = await tipePersediaan.findAll({});

      // 2. Ambil semua ID unik dari pegawaiId dan PJId

      return res.status(200).json({
        resultTipe,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data kendaraan dan pegawai",
        error: err.toString(),
      });
    }
  },

  postPersediaan: async (req, res) => {
    const { nama, kode, NUSP, tipeId } = req.body;
    console.log(req.body);
    try {
      // 1. Ambil data kendaraan dari DB lokal
      const result = await persediaan.create({
        nama,
        kodeBarang: kode,
        NUSP,
        tipePersediaanId: tipeId,
      });

      // 2. Ambil semua ID unik dari pegawaiId dan PJId

      return res.status(200).json({
        result,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data kendaraan dan pegawai",
        error: err.toString(),
      });
    }
  },
  getStokMasuk: async (req, res) => {
    const id = req.params.id;
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const offset = limit * page;
    console.log(req.body);
    try {
      // 1. Ambil data kendaraan dari DB lokal
      const result = await stokMasuk.findAll({
        where: { unitKerjaId: id },
        include: [{ model: persediaan }],
        limit,

        offset,
      });
      const totalRows = await stokMasuk.count({
        limit,

        offset,
        where: { unitKerjaId: id },
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
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data kendaraan dan pegawai",
        error: err.toString(),
      });
    }
  },
  searchPersediaan: async (req, res) => {
    try {
      const { q } = req.query;

      const result = await persediaan.findAll({
        where: {
          nama: {
            [Op.like]: `%${q}%`, // Import Op dari Sequelize
          },
        },
        attributes: ["id", "nama"],
        limit: 10,
        order: [["nama", "ASC"]],
      });

      res.status(200).json({ result });
    } catch (err) {
      res.status(500).json({ message: err.toString(), code: 500 });
    }
  },
  postMasuk: async (req, res) => {
    const {
      persediaanId,
      unitKerjaId,
      jumlah,
      harga,
      tanggal,
      keterangan,
      spesifikasi,
      laporanPersediaanId,
      nomorPesanan,
      suratPesananId,
      sumberDanaId,
      satuanPersediaanId,
    } = req.body;
    console.log(req.body);
    try {
      const result = await stokMasuk.create({
        persediaanId,
        unitKerjaId,
        jumlah,
        hargaSatuan: harga,
        tanggal,
        keterangan,
        spesifikasi,
        laporanPersediaanId,
        nomorPesanan,
        sumberDanaId,
        suratPesananId,
        satuanPersediaanId,
      });

      return res.status(200).json({
        result,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data kendaraan dan pegawai",
        error: err.toString(),
      });
    }
  },
  getStok: async (req, res) => {
    const id = req.params.id;
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const offset = limit * page;
    console.log(req.body);
    try {
      // 1. Ambil data stokMasuk dari DB lokal
      const allStokMasuk = await stokMasuk.findAll({
        where: { unitKerjaId: id },
        include: [{ model: persediaan }, { model: stokKeluar }],
      });

      // 2. Filter data yang jumlah stokMasuk - stokKeluar tidak sama dengan 0
      const filteredResult = allStokMasuk.filter((stok) => {
        const totalKeluar = stok.stokKeluars
          ? stok.stokKeluars.reduce((sum, keluar) => sum + keluar.jumlah, 0)
          : 0;
        const sisaStok = stok.jumlah - totalKeluar;
        return sisaStok > 0;
      });

      // 3. Implementasi pagination manual
      const totalRows = filteredResult.length;
      const totalPage = Math.ceil(totalRows / limit);
      const result = filteredResult.slice(offset, offset + limit);

      return res.status(200).json({
        success: true,
        result,
        page,
        limit,
        totalRows,
        totalPage,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data stok dan persediaan",
        error: err.toString(),
      });
    }
  },

  getStokKeluar: async (req, res) => {
    try {
      const { laporanId, unitKerjaId } = req.query;
      if (!laporanId) {
        return res.status(400).json({ message: "laporanId wajib disertakan" });
      }

      // 1) Periode laporan
      const lap = await laporanPersediaan.findByPk(laporanId);
      if (!lap)
        return res.status(404).json({ message: "Laporan tidak ditemukan" });

      const tanggalAwal = lap.tanggalAwal;
      const tanggalAkhir = lap.tanggalAkhir;
      const statusLaporan = lap.status;

      // 2) Total MASUK sampai akhir periode (tidak di-group, ambil per stokMasuk.id)
      const masukAkhirRows = await stokMasuk.findAll({
        attributes: [
          "id",
          "persediaanId",
          "suratPesananId",
          "sumberDanaId",
          "jumlah",
          "hargaSatuan",
          "tanggal",
          "keterangan",
          "spesifikasi",
        ],
        where: { tanggal: { [Op.lte]: tanggalAkhir }, unitKerjaId },
        order: [["id", "ASC"]],
        raw: true,
      });

      // 3) Total KELUAR sampai akhir periode (per stokMasuk.id)
      const keluarAkhirRows = await stokKeluar.findAll({
        attributes: [
          [col("stokMasuk.id"), "stokMasukId"],
          [col("stokMasuk.persediaanId"), "persediaanId"],
          [col("stokMasuk.suratPesananId"), "suratPesananId"],
          [col("stokMasuk.sumberDanaId"), "sumberDanaId"],
          [
            fn("COALESCE", fn("SUM", col("stokKeluar.jumlah")), 0),
            "qtyKeluarAkhir",
          ],
        ],
        include: [{ model: stokMasuk, attributes: [], where: { unitKerjaId } }],
        where: { tanggal: { [Op.lte]: tanggalAkhir } },
        group: [col("stokMasuk.id")],
        raw: true,
      });

      // 4) Daftar stok keluar HANYA pada periode laporan → untuk array transaksi
      const keluarPeriodeRows = await stokKeluar.findAll({
        attributes: [
          "id",
          "jumlah",
          "tanggal",
          "tujuan",
          "keterangan",
          [col("stokMasuk.id"), "stokMasukId"],
          [col("stokMasuk.persediaanId"), "persediaanId"],
          [col("stokMasuk.suratPesananId"), "suratPesananId"],
          [col("stokMasuk.sumberDanaId"), "sumberDanaId"],
          [col("stokMasuk.hargaSatuan"), "hargaSatuan"],
        ],
        include: [{ model: stokMasuk, attributes: [], where: { unitKerjaId } }],
        where: { tanggal: { [Op.between]: [tanggalAwal, tanggalAkhir] } },
        order: [
          ["tanggal", "ASC"],
          ["id", "ASC"],
        ],
        raw: true,
      });

      // 5) Hitung stok awal (sisa dari TW sebelumnya) dan stok masuk TW sekarang
      const stokAwalRows = await stokMasuk.findAll({
        attributes: [
          "id",
          "persediaanId",
          "suratPesananId",
          "sumberDanaId",
          "jumlah",
          "hargaSatuan",
          "tanggal",
          "keterangan",
          "spesifikasi",
        ],
        where: {
          tanggal: { [Op.lt]: tanggalAwal },
          unitKerjaId,
        },
        order: [["id", "ASC"]],
        raw: true,
      });

      const keluarSebelumRows = await stokKeluar.findAll({
        attributes: [
          [col("stokMasuk.id"), "stokMasukId"],
          [col("stokMasuk.persediaanId"), "persediaanId"],
          [col("stokMasuk.suratPesananId"), "suratPesananId"],
          [col("stokMasuk.sumberDanaId"), "sumberDanaId"],
          [
            fn("COALESCE", fn("SUM", col("stokKeluar.jumlah")), 0),
            "qtyKeluarSebelum",
          ],
        ],
        include: [{ model: stokMasuk, attributes: [], where: { unitKerjaId } }],
        where: { tanggal: { [Op.lt]: tanggalAwal } },
        group: [col("stokMasuk.id")],
        raw: true,
      });

      const stokMasukTWIniRows = await stokMasuk.findAll({
        attributes: [
          "id",
          "persediaanId",
          "suratPesananId",
          "sumberDanaId",
          "jumlah",
          "hargaSatuan",
          "tanggal",
          "keterangan",
          "spesifikasi",
        ],
        where: {
          tanggal: { [Op.between]: [tanggalAwal, tanggalAkhir] },
          unitKerjaId,
        },
        order: [["id", "ASC"]],
        raw: true,
      });

      // 6) Bangun map dari hasil dengan key berdasarkan stokMasuk.id
      const mapMasukAkhir = new Map();
      const mapStokAwal = new Map();
      const mapStokMasukTWIni = new Map();

      // Map untuk stok awal (sisa dari TW sebelumnya) - berdasarkan stokMasuk.id
      stokAwalRows.forEach((r) => {
        const key = `stokMasuk_${r.id}`;
        mapStokAwal.set(key, Number(r.jumlah));
      });

      keluarSebelumRows.forEach((r) => {
        const key = `stokMasuk_${r.stokMasukId}`;
        const stokAwal = mapStokAwal.get(key) || 0;
        const keluarSebelum = Number(r.qtyKeluarSebelum);
        const sisaStok = Math.max(0, stokAwal - keluarSebelum);
        mapStokAwal.set(key, sisaStok);
      });

      // Map untuk stok masuk TW ini - berdasarkan stokMasuk.id
      stokMasukTWIniRows.forEach((r) => {
        const key = `stokMasuk_${r.id}`;
        mapStokMasukTWIni.set(key, Number(r.jumlah));
      });

      // Map untuk stok masuk total sampai akhir periode - berdasarkan stokMasuk.id
      masukAkhirRows.forEach((r) => {
        const key = `stokMasuk_${r.id}`;
        mapMasukAkhir.set(key, Number(r.jumlah));
      });

      const mapKeluarAkhir = new Map();
      keluarAkhirRows.forEach((r) => {
        const key = `stokMasuk_${r.stokMasukId}`;
        mapKeluarAkhir.set(key, Number(r.qtyKeluarAkhir));
      });

      const mapKeluarPeriode = new Map();
      keluarPeriodeRows.forEach((r) => {
        const key = `stokMasuk_${r.stokMasukId}`;
        if (!mapKeluarPeriode.has(key)) mapKeluarPeriode.set(key, []);
        mapKeluarPeriode.get(key).push({
          id: r.id,
          jumlah: Number(r.jumlah),
          tanggal: r.tanggal,
          tujuan: r.tujuan || null,
          keterangan: r.keterangan || null,
          hargaSatuan: Number(r.hargaSatuan) || 0,
        });
      });

      // Persediaan yang perlu dicek = semua yang pernah punya MASUK sampai akhir periode
      const stokMasukKeys = Array.from(mapMasukAkhir.keys());
      if (stokMasukKeys.length === 0) {
        return res.json({
          laporanId,
          periode: { tanggalAwal, tanggalAkhir },
          data: [],
        });
      }

      // 7) Ambil info persediaan + tipePersediaan (kodeRekening)
      const stokMasukIds = stokMasukKeys.map((key) =>
        Number(key.replace("stokMasuk_", ""))
      );

      // Ambil data stokMasuk yang lengkap untuk mendapatkan persediaanId
      const stokMasukLengkap = await stokMasuk.findAll({
        where: { id: { [Op.in]: stokMasukIds } },
        attributes: [
          "id",
          "persediaanId",
          "suratPesananId",
          "sumberDanaId",
          "hargaSatuan",
        ],
        raw: true,
      });

      const stokMasukMap = new Map(stokMasukLengkap.map((sm) => [sm.id, sm]));

      const persediaanIds = [
        ...new Set(stokMasukLengkap.map((sm) => sm.persediaanId)),
      ];

      const persRows = await persediaan.findAll({
        where: { id: { [Op.in]: persediaanIds } },
        include: [
          {
            model: tipePersediaan,
            attributes: ["kodeRekening"],
          },
        ],
        attributes: ["id", "nama", "kodeBarang"],
        raw: true,
        nest: true,
      });
      const persMap = new Map(persRows.map((p) => [p.id, p]));

      // 8) Susun output berdasarkan stokMasuk.id (setiap stokMasuk = 1 baris)
      const data = [];

      for (const stokMasukKey of stokMasukKeys) {
        const stokMasukId = Number(stokMasukKey.replace("stokMasuk_", ""));
        const stokMasukInfo = stokMasukMap.get(stokMasukId);

        if (!stokMasukInfo) continue;

        const { persediaanId, suratPesananId, sumberDanaId, hargaSatuan } =
          stokMasukInfo;

        // Stok awal = sisa dari stokMasuk.id yang sama
        const stokAwal = mapStokAwal.get(stokMasukKey) || 0;
        // Stok masuk TW ini = masuk dengan stokMasuk.id yang sama
        const stokMasukTWIni = mapStokMasukTWIni.get(stokMasukKey) || 0;
        // Total masuk = stok awal + stok masuk TW ini
        const totalMasuk = stokAwal + stokMasukTWIni;
        const keluarAkhir = mapKeluarAkhir.get(stokMasukKey) || 0;
        const saldoAkhir = totalMasuk - keluarAkhir;

        const keluarArr = mapKeluarPeriode.get(stokMasukKey) || [];
        const totalKeluarPeriode = keluarArr.reduce((s, x) => s + x.jumlah, 0);

        // Tampilkan jika ada stok atau ada transaksi keluar
        if (totalMasuk > 0 || keluarArr.length > 0) {
          const info = persMap.get(persediaanId) || {
            nama: null,
            kodeBarang: null,
            tipePersediaan: {},
          };
          data.push({
            stokMasukId: stokMasukId,
            persediaanId: persediaanId,
            kodeBarang: info.kodeBarang,
            namaPersediaan: info.nama,
            kodeRekening: info.tipePersediaan?.kodeRekening || null,
            suratPesananId: suratPesananId,
            sumberDanaId: sumberDanaId,
            hargaSatuan: hargaSatuan,
            stokAwal: stokAwal, // ← Stok sisa dari TW sebelumnya dengan stokMasuk.id yang sama
            stokMasuk: stokMasukTWIni, // ← Stok baru yang masuk di TW ini dengan stokMasuk.id yang sama
            jumlahMasuk: totalMasuk, // ← Total stok (stok awal + stok masuk TW ini)
            stokKeluar: keluarArr,
            totalKeluar: totalKeluarPeriode,
            sisa: saldoAkhir,
          });
        }
      }

      return res.json({
        laporanId: String(laporanId),
        periode: { tanggalAwal, tanggalAkhir, statusLaporan },
        data,
      });
    } catch (err) {
      console.error("Error getStokKeluarPeriodik:", err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan pada server", error: err.message });
    }
  },
  postKeluar: async (req, res) => {
    const { jumlah, tujuan, stokMasukId, laporanPersediaanId, tanggal } =
      req.body;

    console.log(req.body);
    try {
      const result = await stokKeluar.create({
        jumlah,
        tujuan,
        stokMasukId,
        laporanPersediaanId,
        tanggal,
      });

      res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.toString(), code: 500 });
    }
  },
};
