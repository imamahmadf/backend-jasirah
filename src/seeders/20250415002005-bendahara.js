const currentDate = new Date();
const bendaharas = [
  {
    id: 1,
    indukUnitKerjaId: 1,
    pegawaiId: 3,
    jabatan: "Bendahara Pengeluaran",
    sumberDanaId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    indukUnitKerjaId: 1,
    pegawaiId: 2,
    sumberDanaId: 2,
    jabatan: "Bendahara Pengeluaran",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("bendaharas", bendaharas, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("bendaharas", null, {});
  },
};
