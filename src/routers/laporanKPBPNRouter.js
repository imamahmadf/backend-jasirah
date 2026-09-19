const express = require("express");
const laporanKPBPNControllers = require("../controllers/laporanKPBPNControllers");
const {
  authenticateUser,
  authorizeKpbpnRoles,
  ROLE_KPBPN,
} = require("../lib/auth");

const routers = express.Router();

const allowAdminOperasional = [
  authenticateUser,
  authorizeKpbpnRoles([ROLE_KPBPN.SUPER_ADMIN, ROLE_KPBPN.ADMIN]),
];

const allowPetugas = [
  authenticateUser,
  authorizeKpbpnRoles([
    ROLE_KPBPN.SUPER_ADMIN,
    ROLE_KPBPN.ADMIN,
    ROLE_KPBPN.PETUGAS_KEAMANAN,
  ]),
];

const allowSuratJalan = [
  authenticateUser,
  authorizeKpbpnRoles([
    ROLE_KPBPN.SUPER_ADMIN,
    ROLE_KPBPN.ADMIN,
    ROLE_KPBPN.MITRA,
    ROLE_KPBPN.PETUGAS_KEAMANAN,
  ]),
];

const allowKeuangan = [
  authenticateUser,
  authorizeKpbpnRoles([
    ROLE_KPBPN.SUPER_ADMIN,
    ROLE_KPBPN.ADMIN,
    ROLE_KPBPN.KEUANGAN,
  ]),
];

routers.get(
  "/petugas-keamanan",
  ...allowPetugas,
  laporanKPBPNControllers.getLaporanPetugasKeamanan,
);
routers.get("/bast", ...allowAdminOperasional, laporanKPBPNControllers.getLaporanBAST);
routers.get(
  "/surat-jalan",
  ...allowSuratJalan,
  laporanKPBPNControllers.getLaporanSuratJalan,
);
routers.get(
  "/ba-bongkar",
  ...allowAdminOperasional,
  laporanKPBPNControllers.getLaporanBABongkar,
);
routers.get(
  "/konfirmasi-penerimaan",
  ...allowPetugas,
  laporanKPBPNControllers.getLaporanKonfirmasiPenerimaan,
);
routers.get(
  "/keuangan",
  ...allowKeuangan,
  laporanKPBPNControllers.getLaporanKeuangan,
);

module.exports = routers;
