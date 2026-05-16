const {
  tipePersediaan,
  persediaan,
  stokMasuk,
  laporanPersediaan,
  rinObPersediaan,
  obPersediaan,
  stokKeluar,
  sumberDana,
  daftarUnitKerja,
} = require("../models");

const { Op, fn, col } = require("sequelize");

module.exports = {
  getRekapAdminPersediaan: async (req, res) => {
    try {
      const { laporanId } = req.query;
      if (!laporanId) {
        return res.status(400).json({ message: "laporanId wajib disertakan" });
      }

      // Ambil info laporan untuk dapat tanggalAwal & tanggalAkhir
      const laporan = await laporanPersediaan.findByPk(laporanId);
      if (!laporan) {
        return res.status(404).json({ message: "Laporan tidak ditemukan" });
      }

      const { tanggalAwal, tanggalAkhir } = laporan;

      // 1. Ambil semua tipe persediaan dengan persediaan yang memiliki stok
      const result = await tipePersediaan.findAll({
        include: [
          {
            model: persediaan,
            required: true,
            include: [
              {
                model: stokMasuk,
                required: true,
                include: [
                  { model: stokKeluar },
                  {
                    model: sumberDana,
                    attributes: ["id", "sumber", "untukPembayaran"],
                  },
                  {
                    model: daftarUnitKerja,
                    attributes: ["id", "unitKerja", "kode", "asal"],
                  },
                ],
              },
            ],
          },
          {
            model: rinObPersediaan,
            include: [
              { model: obPersediaan, attributes: ["id", "nama", "kode"] },
            ],
          },
        ],
        attributes: ["id", "nama", "kodeRekening"],
        order: [["id", "ASC"]],
      });

      // 2. Olah data untuk hitung stok dengan pendekatan yang lebih efisien
      const rekap = result.map((tp) => {
        // Buat kodeRekening baru untuk tipe persediaan
        let kodeRekeningBaru = "";
        let kodeRekeningParts = [];

        // Ambil kode dari obPersediaan
        if (
          tp.rinObPersediaan &&
          tp.rinObPersediaan.obPersediaan &&
          tp.rinObPersediaan.obPersediaan.kode
        ) {
          kodeRekeningParts.push(tp.rinObPersediaan.obPersediaan.kode);
        }

        // Ambil kode dari rinObPersediaan
        if (tp.rinObPersediaan && tp.rinObPersediaan.kode) {
          kodeRekeningParts.push(tp.rinObPersediaan.kode);
        }

        // Ambil kode dari tipe persediaan
        if (tp.kodeRekening) {
          kodeRekeningParts.push(tp.kodeRekening);
        }

        // Gabungkan semua kode dengan titik sebagai pemisah
        kodeRekeningBaru = kodeRekeningParts.join(".");

        return {
          id: tp.id,
          nama: tp.nama,
          kodeRekening: kodeRekeningBaru, // Gunakan kodeRekening baru
          barang: tp.persediaans
            .map((p) => {
              let stokAwal = 0;
              let masukDalamRange = 0;
              let keluarDalamRange = 0;

              // Hitung stok awal (sebelum tanggalAwal)
              p.stokMasuks.forEach((sm) => {
                const tglMasuk = new Date(sm.tanggal);

                if (tglMasuk < tanggalAwal) {
                  stokAwal += sm.jumlah;

                  // Kurangi dengan stok keluar sebelum periode
                  sm.stokKeluars.forEach((sk) => {
                    const tglKeluar = new Date(sk.tanggal);
                    if (tglKeluar < tanggalAwal) {
                      stokAwal -= sk.jumlah;
                    }
                  });
                }
              });

              // Hitung stok masuk dalam periode
              p.stokMasuks.forEach((sm) => {
                const tglMasuk = new Date(sm.tanggal);
                if (tglMasuk >= tanggalAwal && tglMasuk <= tanggalAkhir) {
                  masukDalamRange += sm.jumlah;
                }
              });

              // Hitung stok keluar dalam periode
              p.stokMasuks.forEach((sm) => {
                sm.stokKeluars.forEach((sk) => {
                  const tglKeluar = new Date(sk.tanggal);
                  if (tglKeluar >= tanggalAwal && tglKeluar <= tanggalAkhir) {
                    keluarDalamRange += sk.jumlah;
                  }
                });
              });

              // Kumpulkan semua informasi stokMasuk yang unik
              const stokMasukInfo = [];
              let totalHargaSatuan = 0;
              let totalStokMasuk = 0;

              // Urutkan stokMasuk berdasarkan tanggal (dari yang terlama ke terbaru)
              const sortedStokMasuk = [...p.stokMasuks].sort((a, b) => {
                return new Date(a.tanggal) - new Date(b.tanggal);
              });

              sortedStokMasuk.forEach((sm) => {
                const tglMasukSM = new Date(sm.tanggal);
                // Abaikan stokMasuk yang terjadi setelah akhir periode
                if (tglMasukSM > tanggalAkhir) {
                  return;
                }

                // Hitung stok awal untuk stokMasuk ini
                let stokAwalStokMasuk = 0;
                if (tglMasukSM < tanggalAwal) {
                  // Jika stokMasuk terjadi sebelum periode laporan, hitung sisa stoknya
                  const totalKeluarSebelumPeriode = sm.stokKeluars
                    ? sm.stokKeluars
                        .filter((sk) => new Date(sk.tanggal) < tanggalAwal)
                        .reduce((sum, sk) => sum + sk.jumlah, 0)
                    : 0;
                  stokAwalStokMasuk = sm.jumlah - totalKeluarSebelumPeriode;
                }

                // Hitung stok masuk dalam periode laporan
                let stokMasukDalamPeriode = 0;
                if (tglMasukSM >= tanggalAwal && tglMasukSM <= tanggalAkhir) {
                  stokMasukDalamPeriode = sm.jumlah;
                }

                // Hitung stok keluar dalam periode laporan
                const stokKeluarDalamPeriode = sm.stokKeluars
                  ? sm.stokKeluars
                      .filter((sk) => {
                        const tglKeluar = new Date(sk.tanggal);
                        return (
                          tglKeluar >= tanggalAwal && tglKeluar <= tanggalAkhir
                        );
                      })
                      .reduce((sum, sk) => sum + sk.jumlah, 0)
                  : 0;

                // Hitung stok akhir
                const stokAkhirStokMasuk =
                  stokAwalStokMasuk +
                  stokMasukDalamPeriode -
                  stokKeluarDalamPeriode;

                // Hanya tampilkan stokMasuk yang:
                // 1. Masih tersisa (stokAkhirStokMasuk > 0), ATAU
                // 2. Ada aktivitas dalam periode laporan (stokMasukDalamPeriode > 0 ATAU stokKeluarDalamPeriode > 0)
                if (
                  stokAkhirStokMasuk > 0 ||
                  stokMasukDalamPeriode > 0 ||
                  stokKeluarDalamPeriode > 0
                ) {
                  // Hitung total untuk rata-rata harga satuan (hanya dari stok yang tersisa)
                  totalHargaSatuan +=
                    (sm.hargaSatuan || 0) * stokAkhirStokMasuk;
                  totalStokMasuk += stokAkhirStokMasuk;

                  // Kumpulkan detail stokMasuk dengan stokKeluar yang menempel
                  const stokMasukDetail = {
                    id: sm.id,
                    jumlah: stokAwal === 0 ? sm.jumlah : stokAkhirStokMasuk, // Periode pertama: jumlah asli, periode berikutnya: sisaStok
                    sisaStok: stokAkhirStokMasuk, // Tambahkan informasi sisa stok
                    stokAwal: stokAwalStokMasuk, // Stok awal untuk stokMasuk ini
                    stokMasuk: stokMasukDalamPeriode, // Jumlah stok yang masuk di periode laporan
                    stokKeluar: stokKeluarDalamPeriode, // Total stok yang keluar di periode laporan
                    stokAkhir: stokAkhirStokMasuk, // Stok akhir untuk stokMasuk ini
                    hargaSatuan: sm.hargaSatuan || 0,
                    tanggal: sm.tanggal,
                    keterangan: sm.keterangan,
                    spesifikasi: sm.spesifikasi,
                    unitKerja: sm.daftarUnitKerja
                      ? {
                          id: sm.daftarUnitKerja.id,
                          unitKerja: sm.daftarUnitKerja.unitKerja,
                          kode: sm.daftarUnitKerja.kode,
                          asal: sm.daftarUnitKerja.asal,
                        }
                      : null,
                    sumberDana: sm.sumberDana
                      ? {
                          id: sm.sumberDana.id,
                          sumber: sm.sumberDana.sumber,
                          untukPembayaran: sm.sumberDana.untukPembayaran,
                        }
                      : null,
                    detailStokKeluar: sm.stokKeluars
                      ? sm.stokKeluars
                          .filter((sk) => {
                            // Hanya tampilkan stokKeluar yang keluar dalam periode laporan
                            const tglKeluar = new Date(sk.tanggal);
                            return (
                              tglKeluar >= tanggalAwal &&
                              tglKeluar <= tanggalAkhir
                            );
                          })
                          .map((sk) => ({
                            id: sk.id,
                            jumlah: sk.jumlah,
                            tanggal: sk.tanggal,
                            tujuan: sk.tujuan,
                            keterangan: sk.keterangan,
                          }))
                      : [],
                  };

                  stokMasukInfo.push(stokMasukDetail);
                }
              });

              // Hitung rata-rata harga satuan
              const rataRataHargaSatuan =
                totalStokMasuk > 0
                  ? Math.round(totalHargaSatuan / totalStokMasuk)
                  : 0;

              const stokAkhir = stokAwal + masukDalamRange - keluarDalamRange;

              // Buat kodeBarang gabungan
              let kodeBarangGabungan = "";
              let kodeParts = [];

              // Ambil kode dari obPersediaan
              if (
                tp.rinObPersediaan &&
                tp.rinObPersediaan.obPersediaan &&
                tp.rinObPersediaan.obPersediaan.kode
              ) {
                kodeParts.push(tp.rinObPersediaan.obPersediaan.kode);
              }

              // Ambil kode dari rinObPersediaan
              if (tp.rinObPersediaan && tp.rinObPersediaan.kode) {
                kodeParts.push(tp.rinObPersediaan.kode);
              }

              // Ambil kode dari tipe persediaan
              if (tp.kodeRekening) {
                kodeParts.push(tp.kodeRekening);
              }

              // Ambil kode dari persediaan
              if (p.kodeBarang) {
                kodeParts.push(p.kodeBarang);
              }

              // Gabungkan semua kode dengan titik sebagai pemisah
              kodeBarangGabungan = kodeParts.join(".");

              return {
                persediaanId: p.id,
                namaBarang: p.nama,
                kodeBarang: p.kodeBarang,
                kodeBarangGabungan: kodeBarangGabungan,
                stokAwal,
                masuk: masukDalamRange,
                keluar: keluarDalamRange,
                stokAkhir,
                rataRataHargaSatuan,
                detailStokMasuk: stokMasukInfo,
                // Tambahan: persentase perubahan stok
                perubahanStok:
                  stokAwal > 0
                    ? (((stokAkhir - stokAwal) / stokAwal) * 100).toFixed(2)
                    : 0,
              };
            })
            .filter(
              (barang) =>
                barang.stokAkhir > 0 || barang.masuk > 0 || barang.keluar > 0
            ), // Hanya tampilkan yang ada aktivitas
        };
      });

      // 3. Hitung total per tipe persediaan
      const rekapDenganTotal = rekap.map((tp) => {
        // Hitung total berdasarkan sisa stok di periode tersebut
        const totalStokAwal = tp.barang.reduce((sum, b) => sum + b.stokAwal, 0);
        const totalMasuk = tp.barang.reduce((sum, b) => sum + b.masuk, 0);
        const totalKeluar = tp.barang.reduce((sum, b) => sum + b.keluar, 0);
        const totalStokAkhir = tp.barang.reduce(
          (sum, b) => sum + b.stokAkhir,
          0
        );

        // Hitung total nilai aset berdasarkan sisa stok × harga satuan
        const totalNilaiAset = tp.barang.reduce((sum, b) => {
          let nilaiAsetBarang = 0;
          b.detailStokMasuk.forEach((stokMasuk) => {
            nilaiAsetBarang += stokMasuk.sisaStok * stokMasuk.hargaSatuan;
          });
          return sum + nilaiAsetBarang;
        }, 0);

        // Hitung total berdasarkan sumber dana (berdasarkan sisa stok)
        const totalBerdasarkanSumberDana = {};

        tp.barang.forEach((barang) => {
          barang.detailStokMasuk.forEach((stokMasuk) => {
            if (stokMasuk.sumberDana) {
              const sumberDanaId = stokMasuk.sumberDana.id;
              const sumberDanaNama = stokMasuk.sumberDana.sumber;

              if (!totalBerdasarkanSumberDana[sumberDanaId]) {
                totalBerdasarkanSumberDana[sumberDanaId] = {
                  id: sumberDanaId,
                  nama: sumberDanaNama,
                  stokAwal: 0,
                  masuk: 0,
                  keluar: 0,
                  stokAkhir: 0,
                  nilaiStok: 0,
                  detailPersediaan: [], // Tambahkan array untuk detail per persediaan
                };
              }

              // Hitung berdasarkan sisa stok yang tersisa di periode tersebut
              const sisaStok = stokMasuk.sisaStok;
              const nilaiStok = sisaStok * stokMasuk.hargaSatuan;

              totalBerdasarkanSumberDana[sumberDanaId].stokAkhir += sisaStok;
              totalBerdasarkanSumberDana[sumberDanaId].nilaiStok += nilaiStok;

              // Tambahkan detail per persediaan
              const detailPersediaan = {
                persediaanId: barang.persediaanId,
                namaBarang: barang.namaBarang,
                kodeBarang: barang.kodeBarang,
                sisaStok: sisaStok,
                hargaSatuan: stokMasuk.hargaSatuan,
                nilaiStok: nilaiStok,
                tanggalMasuk: stokMasuk.tanggal,
                keterangan: stokMasuk.keterangan,
                spesifikasi: stokMasuk.spesifikasi,
              };

              totalBerdasarkanSumberDana[sumberDanaId].detailPersediaan.push(
                detailPersediaan
              );
            }
          });
        });

        // Konversi ke array
        const totalSumberDanaArray = Object.values(totalBerdasarkanSumberDana);

        return {
          ...tp,
          total: {
            stokAwal: totalStokAwal,
            masuk: totalMasuk,
            keluar: totalKeluar,
            stokAkhir: totalStokAkhir,
            nilaiAset: totalNilaiAset,
            berdasarkanSumberDana: totalSumberDanaArray,
          },
        };
      });

      return res.status(200).json({
        success: true,
        laporan: {
          id: laporan.id,
          nama: laporan.nama,
          tanggalAwal,
          tanggalAkhir,
          status: laporan.status,
        },
        result: rekapDenganTotal,
      });
    } catch (err) {
      console.error("Error getRekapAdminPersediaan:", err);
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan pada server",
        error: err.message,
      });
    }
  },
};
