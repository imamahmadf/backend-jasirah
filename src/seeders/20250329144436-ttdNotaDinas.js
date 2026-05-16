const currentDate = new Date();
const ttdNotaDinas = [
  {
    id: 1,
    jabatan: "Plh. Kabid",
    unitKerjaId: 1,
    pegawaiId: 6,

    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    jabatan: "Plh. Kabid 1",
    unitKerjaId: 1,
    pegawaiId: 2,

    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    jabatan: "Plh. kabid 2",
    unitKerjaId: 1,
    pegawaiId: 1,

    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 4,
    jabatan: "Plh. kabid 3",
    unitKerjaId: 5,
    pegawaiId: 3,

    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("ttdNotaDinas", ttdNotaDinas, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("ttdNotaDinas", null, {});
  },
};
