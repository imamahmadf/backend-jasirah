const currentDate = new Date();
const sumberDanas = [
  {
    id: 1,
    sumber: "APBD",
    untukPembayaran: "untuk pembayaran ABPD",
    kalimat1: "",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    sumber: "BLUD",
    untukPembayaran: "untuk pembayaran BLUD",
    kalimat1: "Peningkatan Pelayanan BLUD",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    sumber: "BOK-PKM",
    untukPembayaran: "untuk pembayaran BOK-PKM",
    kalimat1: "(Dak Non Fisik)",
    createdAt: currentDate,
    updatedAt: currentDate,
  },

  {
    id: 4,
    sumber: "BOK",
    untukPembayaran: "untuk pembayaran BOK",
    kalimat1: "",
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
