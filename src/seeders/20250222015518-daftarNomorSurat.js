const currentDate = new Date();
const daftarNomorSurats = [
  {
    id: "1",
    nomorLoket: "0",
    createdAt: currentDate,
    updatedAt: currentDate,
    jenisId: "1",
    indukUnitKerjaId: "1",
  },
  {
    id: "2",
    nomorLoket: "0",
    createdAt: currentDate,
    updatedAt: currentDate,
    jenisId: "2",
    indukUnitKerjaId: "1",
  },
  {
    id: "3",
    nomorLoket: "0",
    createdAt: currentDate,
    updatedAt: currentDate,
    jenisId: "3",
    indukUnitKerjaId: "1",
  },
  {
    id: "4",
    nomorLoket: "0",
    createdAt: currentDate,
    updatedAt: currentDate,
    jenisId: "1",
    indukUnitKerjaId: "2",
  },
  {
    id: "5",
    nomorLoket: "0",
    createdAt: currentDate,
    updatedAt: currentDate,
    jenisId: "2",
    indukUnitKerjaId: "2",
  },
  {
    id: "6",
    nomorLoket: "0",
    createdAt: currentDate,
    updatedAt: currentDate,
    jenisId: "3",
    indukUnitKerjaId: "2",
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("daftarNomorSurats", daftarNomorSurats, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("daftarNomorSurats", null, {});
  },
};
