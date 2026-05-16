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
  {
    id: 3,
    jenis: "Perjalanan Pelayanan Kesehatan",
    tipePerjalananId: 1,
    kodeRekening: ".5.1.02.04.01.0003",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 4,
    jenis: "Perjalanan Dinas Biasa (BOK-PKM)",
    kodeRekening: ".5.1.02.90.01.0001",
    tipePerjalananId: 2,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 5,
    jenis: "Perjalanan dinas Dalam Kota (BOK-PKM)",
    kodeRekening: ".5.1.02.90.01.0001",
    tipePerjalananId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 6,
    jenis: "Perjalanan Pelayanan Kesehatan (BOK-PKM)",
    tipePerjalananId: 1,
    kodeRekening: ".5.1.02.90.01.0001",
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
