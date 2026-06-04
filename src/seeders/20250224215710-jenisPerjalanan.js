const currentDate = new Date();
const jenisPerjalanans = [
  {
    id: 1,
    jenis: "Perjalanan Dinas Biasa",
    kodeRekening: ".5.1.02.04.01.0001",
    tipePerjalananId: 2,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    jenis: "Perjalanan dinas Dalam Kota",
    kodeRekening: ".5.1.02.04.01.0003",
    tipePerjalananId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("jenisPerjalanans", jenisPerjalanans, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("jenisPerjalanans", null, {});
  },
};
