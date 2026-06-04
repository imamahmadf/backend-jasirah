"use strict";

const currentDate = new Date();
const satuanPersediaans = [
  { id: 1, satuan: "Lembar", createdAt: currentDate, updatedAt: currentDate },
  {
    id: 2,
    satuan: "Box",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    satuan: "Buah",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 4,
    satuan: "Unit",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 5,
    satuan: "Rim",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 6,
    satuan: "Pcs",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 7,
    satuan: "Pack",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 8,
    satuan: "Set",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 9,
    satuan: "Botol",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 10,
    satuan: "Kaleng",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 11,
    satuan: "Tube",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 12,
    satuan: "Sachet",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 13,
    satuan: "Strip",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 14,
    satuan: "Vial",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 15,
    satuan: "Ampul",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 16,
    satuan: "Tablet",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 17,
    satuan: "Kapsul",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 18,
    satuan: "Kg",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 19,
    satuan: "Gram",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 20,
    satuan: "Ton",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 21,
    satuan: "Liter",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 22,
    satuan: "Mililiter",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 23,
    satuan: "Galon",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 24,
    satuan: "Jerigen",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 25,
    satuan: "Drum",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 26,
    satuan: "Karung",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 27,
    satuan: "Sak",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 28,
    satuan: "Zak",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 29,
    satuan: "Roll",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 30,
    satuan: "Gulung",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 31,
    satuan: "Batang",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 32,
    satuan: "Lonjor",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 33,
    satuan: "Meter",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 34,
    satuan: "Meter Persegi",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 35,
    satuan: "Meter Kubik",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 36,
    satuan: "Kubik",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 37,
    satuan: "Pasang",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 38,
    satuan: "Lusin",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 39,
    satuan: "Dozen",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 40,
    satuan: "Tabung",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 41,
    satuan: "Tangki",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 42,
    satuan: "Tray",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 43,
    satuan: "Bundel",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 44,
    satuan: "Paket",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 45,
    satuan: "Ekor",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 46,
    satuan: "Orang",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 47,
    satuan: "Trip",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 48,
    satuan: "Hari",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 49,
    satuan: "Bulan",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 50,
    satuan: "Tahun",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("satuanPersediaans", satuanPersediaans, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("satuanPersediaans", null, {});
  },
};
