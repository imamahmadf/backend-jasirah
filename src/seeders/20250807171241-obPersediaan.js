const currentDate = new Date();
const obPersediaans = [
  {
    id: 1,
    nama: "Barang Pakai Habis",
    createdAt: currentDate,
    updatedAt: currentDate,
    Kode: "1.1.7.01",
  },
  {
    id: 2,
    nama: "Barang Tak Habis Pakai",
    createdAt: currentDate,
    updatedAt: currentDate,
    Kode: "1.1.7.02",
  },
  {
    id: 3,
    nama: "Barang Bekas Dipakai",
    createdAt: currentDate,
    updatedAt: currentDate,
    Kode: "1.1.7.03",
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("obPersediaans", obPersediaans, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("obPersediaans", null, {});
  },
};
