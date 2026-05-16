require("dotenv/config");
const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const { join, dirname } = require("path");

const { env } = require("./config");
const {
  perjalananRouter,
  pegawaiRouter,
  kwitansiRouter,
  dalamKotaRouter,
  rillRouter,
  userRouter,
  templateRouter,
  adminRouter,
  klasifikasiRouter,
  tujuanRouter,
  indukUnitKerjaRouter,
  pajakRouter,
  keuanganRouter,
  nomorSuratRouter,
  subKegiatanRouter,
  rekapRouter,
  sijakaRouter,
  notifikasiRouter,
  kendaraanRouter,
  usulanPegawaiRouter,
  persediaanRouter,
  laporanPersediaanRouter,
  rekapAsetRouter,
  suratPesananRouter,
  bangunanRouter,
  naikJenjangRouter,
  kwitGlobalRouter,
  verifikasiRouter,
  perencanaanRouter,
  capaianRouter,
  kendaraanDinasRouter,
  barjasRouter,
  PJPLRouter,
  atasanPJPLRouter,
  perencanaanAdminRouter,
  satuanIndikatorRouter,
  indikatorRouter,
  templateBPDRouter
} = require("./routers");

const PORT = process.env.PORT || 8000;
const app = express();

// BUAT HTTP SERVER UNTUK SOCKET.IO
const server = http.createServer(app);

// KONFIGURASI CORS UNTUK SOCKET.IO
const allowedOrigins = process.env.WHITELISTED_DOMAIN
  ? process.env.WHITELISTED_DOMAIN.split(",").map((origin) => origin.trim())
  : "*";

// INISIALISASI SOCKET.IO DENGAN KONFIGURASI PRODUCTION
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  // Transport fallback: coba websocket dulu, jika gagal pakai polling
  transports: ["websocket", "polling"],
  // Allow upgrade dari polling ke websocket
  allowUpgrades: true,
  // Timeout untuk connection
  pingTimeout: 60000,
  pingInterval: 25000,
  // Handle proxy/load balancer di production
  // Jika menggunakan reverse proxy (nginx, cloudflare, dll)
  // Set ini ke true untuk trust proxy headers
  allowEIO3: true,
});

// SIMPAN io ke dalam app supaya bisa dipakai di controller
app.set("socketio", io);

// SIMPAN io secara global untuk bisa diakses dari model hooks (opsional)
global.socketIO = io;

// LOGIC SOCKET
io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  // Contoh listener event dari client
  socket.on("ping", () => {
    console.log("📡 Ping diterima dari client");
    socket.emit("pong");
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// ===========================
// MIDDLEWARE
app.use(
  cors({
    origin: process.env.WHITELISTED_DOMAIN
      ? process.env.WHITELISTED_DOMAIN.split(",")
      : "*",
  })
);

app.use(express.json());
app.use("/api", express.static(`${__dirname}/public`));

// ===========================
// ROUTES API
app.use("/api/perjalanan", perjalananRouter);
app.use("/api/pegawai", pegawaiRouter);
app.use("/api/kwitansi", kwitansiRouter);
app.use("/api/dalam-kota", dalamKotaRouter);
app.use("/api/rill", rillRouter);
app.use("/api/user", userRouter);
app.use("/api/template", templateRouter);
app.use("/api/admin", adminRouter);
app.use("/api/klasifikasi", klasifikasiRouter);
app.use("/api/tujuan", tujuanRouter);
app.use("/api/induk-unit-kerja", indukUnitKerjaRouter);
app.use("/api/pajak", pajakRouter);
app.use("/api/keuangan", keuanganRouter);
app.use("/api/nomor-surat", nomorSuratRouter);
app.use("/api/sub-kegiatan", subKegiatanRouter);
app.use("/api/sijaka", sijakaRouter);
app.use("/api/rekap", rekapRouter);
app.use("/api/notifikasi", notifikasiRouter);
app.use("/api/kendaraan", kendaraanRouter);
app.use("/api/usulan", usulanPegawaiRouter);
app.use("/api/persediaan", persediaanRouter);
app.use("/api/laporan-persediaan", laporanPersediaanRouter);
app.use("/api/rekap-aset", rekapAsetRouter);
app.use("/api/surat-pesanan", suratPesananRouter);
app.use("/api/bangunan", bangunanRouter);
app.use("/api/naik-jenjang", naikJenjangRouter);
app.use("/api/kwitansi-global", kwitGlobalRouter);
app.use("/api/verifikasi", verifikasiRouter);
app.use("/api/perencanaan", perencanaanRouter);
app.use("/api/capaian", capaianRouter);
app.use("/api/kendaraan-dinas", kendaraanDinasRouter);
app.use("/api/barjas", barjasRouter);
app.use("/api/PJPL", PJPLRouter);
app.use("/api/atasan-PJPL", atasanPJPLRouter);
app.use("/api/admin-perencanaan", perencanaanAdminRouter);
app.use("/api/satuan-indikator", satuanIndikatorRouter);
app.use("/api/indikator", indikatorRouter);
app.use("/api/templateBPD", templateBPDRouter);

app.get("/api", (req, res) => {
  res.send(`Hello, this is my API`);
});

app.get("/api/greetings", (req, res, next) => {
  res.status(200).json({
    message: "Hello, guys !",
  });
});

// Endpoint untuk mendapatkan konfigurasi Socket.IO (untuk frontend)
app.get("/api/socket-config", (req, res) => {
  const protocol = req.protocol; // http atau https
  const host = req.get("host"); // domain atau IP
  const socketUrl = `${protocol}://${host}`;

  res.status(200).json({
    socketUrl: socketUrl,
    message: "Gunakan URL ini untuk koneksi Socket.IO di frontend",
  });
});

// ===========================
// ERROR HANDLING

app.use((req, res, next) => {
  if (req.path.includes("/api/")) {
    res.status(404).send("Not found !");
  } else {
    next();
  }
});

app.use((err, req, res, next) => {
  if (req.path.includes("/api/")) {
    console.error("Error : ", err.stack);
    res.status(500).send("Error !");
  } else {
    next();
  }
});

// ===========================
// MULAIKAN SERVER
server.listen(PORT, (err) => {
  if (err) {
    console.log(`❌ ERROR: ${err}`);
  } else {
    console.log(`✅ APP RUNNING at ${PORT}`);
  }
});
