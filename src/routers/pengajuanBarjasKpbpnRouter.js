const express = require("express");
const { pengajuanBarjasKpbpnControllers, barangJasaKpbpnControllers } = require("../controllers");
const fileUploader = require("../middleware/uploader");

const routers = express.Router();

const fotoUploader = fileUploader({
  destinationFolder: "pengajuan-barjas",
  fileType: "image",
  prefix: "PENGAJUAN",
}).any();

routers.get("/barang-jasa/riwayat/:id", barangJasaKpbpnControllers.getRiwayat);
routers.get("/barang-jasa", barangJasaKpbpnControllers.getAll);
routers.post("/barang-jasa/stok/:id", barangJasaKpbpnControllers.pakaiStok);
routers.post("/barang-jasa/daftarkan", barangJasaKpbpnControllers.daftarkanDariItem);
routers.post("/barang-jasa/edit/:id", barangJasaKpbpnControllers.edit);
routers.post("/barang-jasa/delete/:id", barangJasaKpbpnControllers.remove);
routers.post("/barang-jasa", barangJasaKpbpnControllers.create);
routers.get("/admin/stats", pengajuanBarjasKpbpnControllers.getAdminStats);
routers.post("/admin/delete-all", pengajuanBarjasKpbpnControllers.deleteAll);
routers.get("/seed", pengajuanBarjasKpbpnControllers.getSeed);
routers.get("/get", pengajuanBarjasKpbpnControllers.getAll);
routers.get("/cetak/:id", pengajuanBarjasKpbpnControllers.cetak);
routers.get("/detail/:id", pengajuanBarjasKpbpnControllers.getDetail);
routers.post("/post", fotoUploader, pengajuanBarjasKpbpnControllers.create);
routers.post("/edit/:id", fotoUploader, pengajuanBarjasKpbpnControllers.edit);
routers.post("/status/:id", pengajuanBarjasKpbpnControllers.updateStatus);
routers.post("/mengetahui/:id", pengajuanBarjasKpbpnControllers.updateMengetahui);
routers.post("/menyetujui/:id", pengajuanBarjasKpbpnControllers.updateMenyetujui);
routers.post("/estimasi/:id", pengajuanBarjasKpbpnControllers.updateEstimasi);
routers.post("/harga/:id", pengajuanBarjasKpbpnControllers.updateHarga);
routers.post("/delete/:id", pengajuanBarjasKpbpnControllers.remove);

module.exports = routers;
