const currentDate = new Date();
const jenisSurats = [
  {
    id: 1,
    jenis: "Surat Tugas",
    nomorSurat: "800.1.11.1/NOMOR/KODE/BULAN/2025",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    jenis: "Nota Dinas/Telaahan Staff",
    nomorSurat: "KLASIFIKASI/NOMOR/KODE/BULAN/2025",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    jenis: "SPD",
    nomorSurat: "000.1.2.3/NOMOR/KODE/BULAN/2025",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("jenisSurats", jenisSurats, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("jenisSurats", null, {});
  },
};
