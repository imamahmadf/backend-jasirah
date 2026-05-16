const currentDate = new Date();
const ttdSuratTugas = [
  {
    id: 1,
    jabatan: "kepala Dinas Kesehatan",
    indukUnitKerjaId: 1,
    pegawaiId: 6,

    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    jabatan: "Plh. kepala Dinas Kesehatan",
    indukUnitKerjaId: 1,
    pegawaiId: 2,

    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    jabatan: "Plh. kepala Dinas Kesehatan",
    indukUnitKerjaId: 1,
    pegawaiId: 1,

    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 4,
    jabatan: "Plh. kepala Dinas Kesehatan",
    indukUnitKerjaId: 2,
    pegawaiId: 3,

    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("ttdSuratTugas", ttdSuratTugas, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("ttdSuratTugas", null, {});
  },
};
