const currentDate = new Date();
const bendaharas = [
  {
    id: 1,
    indukUnitKerjaId: 1,
    pegawaiId: 7,
    jabatan: "Bendahara Pengeluaran",
    sumberDanaId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    indukUnitKerjaId: 1,
    pegawaiId: 8,
    sumberDanaId: 2,
    jabatan: "Bendahara Pengeluaran",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    indukUnitKerjaId: 2,
    sumberDanaId: 1,
    pegawaiId: 9,
    jabatan: "Bendahara Pengeluaran Pembantu",
    createdAt: currentDate,
    updatedAt: currentDate,
  },

  {
    id: 4,
    indukUnitKerjaId: 3,
    sumberDanaId: 1,
    pegawaiId: 10,
    jabatan: "Bendahara Pengeluaran Pembantu",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 5,
    indukUnitKerjaId: 2,
    sumberDanaId: 2,
    pegawaiId: 11,
    jabatan: "Bendahara Pengeluaran Pembantu",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 6,
    indukUnitKerjaId: 3,
    sumberDanaId: 3,
    pegawaiId: 12,
    jabatan: "Bendahara Pengeluaran Pembantu",
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
