const currentDate = new Date();
const statuses = [
  {
    id: 1,
    statusKuitansi: "SPD dan Surat Tugas Sudah dibuat",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    statusKuitansi: "Pengajuan kuitansi",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    statusKuitansi: "Kuitansi tervierifikasi",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 4,
    statusKuitansi: "Kuitansi ditolak",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("statuses", statuses, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("statuses", null, {});
  },
};
