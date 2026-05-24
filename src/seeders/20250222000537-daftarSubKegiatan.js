const currentDate = new Date();
const daftarSubKegiatans = [
  {
    id: 1,
    subKegiatan: "Perjalanan Dinas Monitoring dan Evaluasi",
    kodeRekening: "1.02.01.2.01.01",
    unitKerjaId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    subKegiatan: "Perjalanan Dinas Pertemuan",
    kodeRekening: "1.02.01.2.01.04",
    unitKerjaId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "daftarSubKegiatans",
      daftarSubKegiatans,
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("daftarSubKegiatans", null, {});
  },
};
