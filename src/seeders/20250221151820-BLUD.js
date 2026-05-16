const currentDate = new Date();
const BLUDs = [
  {
    id: 1,
    jenis: "BLUD",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    jenis: "Bukan BLUD",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("BLUDs", BLUDs, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("BLUDs", null, {});
  },
};
