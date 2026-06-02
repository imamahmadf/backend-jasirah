const currentDate = new Date();
const indukUnitKerjas = [
  {
    id: 1,
    indukUnitKerja: "PT. Jasirah Diza Berjaya",
    kodeInduk: "JDB",
    BLUDId: 2,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    indukUnitKerja: "Koperasi Produsen Batanghari Patra Nusantara",
    kodeInduk: "KPBPN",
    BLUDId: 2,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    indukUnitKerja: "Koperasi Produsen Batanghari Sumber Energi",
    kodeInduk: "KPBSE",
    BLUDId: 2,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 4,
    indukUnitKerja: "Burung Hantu",
    kodeInduk: "BURHAN",
    BLUDId: 2,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("indukUnitKerjas", indukUnitKerjas, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("indukUnitKerjas", null, {});
  },
};
