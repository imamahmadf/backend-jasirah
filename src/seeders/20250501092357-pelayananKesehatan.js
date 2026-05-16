const currentDate = new Date();
const pelayananKesehatans = [
  {
    id: 1,
    jenis: "Bukan Pelayanan Kesehatan",
    uangTransport: 0,

    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    jenis: "Pembinaan",
    uangTransport: 60000,

    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    jenis: "Pelayanan",
    uangTransport: 132000,

    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "pelayananKesehatans",
      pelayananKesehatans,
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("pelayananKesehatans", null, {});
  },
};
