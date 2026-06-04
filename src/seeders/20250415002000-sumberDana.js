const currentDate = new Date();
const sumberDanas = [
  {
    id: 1,
    sumber: "Kas Besar",
    untukPembayaran: "untuk pembayaran ABPD",
    kalimat1: "",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    sumber: "Kas Kecil",
    untukPembayaran: "untuk pembayaran BLUD",
    kalimat1: "Peningkatan Pelayanan BLUD",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("sumberDanas", sumberDanas, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("sumberDanas", null, {});
  },
};
