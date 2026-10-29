const path = require("path");
const fs = require("fs");
const QRCode = require("qrcode");
const qrcodeTerminal = require("qrcode-terminal");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");

const WA_SENDER_NUMBER = process.env.WA_SENDER_NUMBER || "08175101951";
const QR_FILE_PATH = path.join(__dirname, "../public/wa-qr.png");

const resolveChromePath = () => {
  const candidates = [
    process.env.WA_CHROME_PATH,
    process.platform === "win32"
      ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
      : "/usr/bin/google-chrome",
    process.platform === "win32"
      ? "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
      : "/usr/bin/chromium-browser",
  ].filter(Boolean);

  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
};

let client;
let clientReady = false;
let hasQr = false;
let readyPromise;
let readyResolve;
const messageQueue = [];

const formatWaPhone = (phone) => {
  if (!phone) return null;
  let digits = String(phone).replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
  else if (!digits.startsWith("62")) digits = `62${digits}`;
  return digits;
};

const getSenderClientId = () => {
  const formatted = formatWaPhone(WA_SENDER_NUMBER);
  return formatted ? `jasirah-${formatted}` : "jasirah-wa";
};

const resetReadyPromise = () => {
  readyPromise = new Promise((resolve) => {
    readyResolve = resolve;
  });
};

const saveQrCode = async (qr) => {
  hasQr = true;
  const publicDir = path.dirname(QR_FILE_PATH);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  await QRCode.toFile(QR_FILE_PATH, qr, { width: 320, margin: 2 });
};

const processMessageQueue = async () => {
  if (!clientReady || messageQueue.length === 0) return;

  const pending = [...messageQueue];
  messageQueue.length = 0;

  for (const item of pending) {
    const result = await sendMessageNow(item.phone, item.message, item.dokumen);
    if (!result.success) {
      console.warn(
        `Gagal kirim WA antrian ke ${item.phone}:`,
        result.error,
      );
    }
  }
};

const sendMessageNow = async (phone, message, dokumen) => {
  const formattedPhone = formatWaPhone(phone);
  if (!formattedPhone) {
    return { success: false, error: "Nomor kontak tidak valid" };
  }

  try {
    const chatId = `${formattedPhone}@c.us`;
    if (dokumen?.data) {
      const media = new MessageMedia(
        dokumen.mimetype || "application/pdf",
        dokumen.data,
        dokumen.filename || "dokumen.pdf",
      );
      await client.sendMessage(chatId, media, { caption: message });
      console.log(`📤 Pesan dan dokumen terkirim ke ${formattedPhone}`);
    } else {
      await client.sendMessage(chatId, message);
      console.log(`📤 Pesan terkirim ke ${formattedPhone}`);
    }
    return { success: true };
  } catch (err) {
    console.error("❌ Gagal kirim pesan:", err.message);
    return { success: false, error: err.message };
  }
};

const initWaClient = () => {
  if (client) return client;

  resetReadyPromise();

  const chromePath = resolveChromePath();
  console.log(
    `🔄 Menghubungkan WhatsApp pengirim ${WA_SENDER_NUMBER}...`,
  );
  console.log(
    chromePath
      ? `   Browser: ${chromePath}`
      : "   Browser bawaan library (Chrome sistem tidak ditemukan)",
  );
  console.log("   QR akan tersedia di http://localhost:8000/api/wa/qr");

  client = new Client({
    authStrategy: new LocalAuth({ clientId: getSenderClientId() }),
    puppeteer: {
      headless: true,
      ...(chromePath ? { executablePath: chromePath } : {}),
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-features=IsolateOrigins,site-per-process,MemorySaverMode",
        "--memory-pressure-off",
      ],
    },
  });

  client.on("qr", async (qr) => {
    try {
      await saveQrCode(qr);
      console.log(`\n📲 QR WhatsApp siap! Buka: http://localhost:8000/api/wa/qr`);
      console.log(`   Scan dengan nomor ${WA_SENDER_NUMBER}\n`);
      qrcodeTerminal.generate(qr, { small: true });
    } catch (err) {
      console.error("❌ Gagal menyimpan QR:", err.message);
    }
  });

  client.on("authenticated", () => {
    console.log("🔐 WhatsApp terautentikasi, menunggu client siap...");
    const cobaLanjut = async (percobaan) => {
      if (clientReady || !client.pupPage || percobaan > 6) return;
      try {
        const info = await client.pupPage.evaluate(() => {
          const buttons = [
            ...document.querySelectorAll("button, div[role='button']"),
          ];
          const lanjut = buttons.find((el) =>
            /^(gunakan di sini|use here|lanjut|continue)$/i.test(
              (el.innerText || "").trim(),
            ),
          );
          if (lanjut) lanjut.click();
          return {
            diklik: Boolean(lanjut),
            teks: (document.body?.innerText || "")
              .replace(/\s+/g, " ")
              .slice(0, 300),
          };
        });
        if (info.diklik) {
          console.log(
            "➡️ Tombol lanjut WhatsApp Web diklik, menunggu client siap...",
          );
        } else if (percobaan === 6) {
          console.warn(
            "⚠️ WhatsApp belum siap. Isi halaman:",
            info.teks || "(kosong)",
          );
        }
      } catch (err) {
        if (percobaan === 6) {
          console.warn(
            "⚠️ WhatsApp belum siap. Halaman tidak terbaca:",
            err.message,
          );
        }
      }
      setTimeout(() => cobaLanjut(percobaan + 1), 5000);
    };
    setTimeout(() => cobaLanjut(1), 5000);
  });

  client.on("loading_screen", (percent, message) => {
    console.log(`⏳ WhatsApp loading: ${percent}% - ${message}`);
  });

  client.on("change_state", (state) => {
    console.log(`ℹ️ WhatsApp state: ${state}`);
  });

  client.on("ready", async () => {
    clientReady = true;
    hasQr = false;
    readyResolve(true);

    if (fs.existsSync(QR_FILE_PATH)) {
      fs.unlinkSync(QR_FILE_PATH);
    }

    const connectedNumber = client.info?.wid?.user;
    const expectedNumber = formatWaPhone(WA_SENDER_NUMBER);

    if (
      connectedNumber &&
      expectedNumber &&
      connectedNumber !== expectedNumber
    ) {
      console.warn(
        `⚠️ Akun WA terhubung (${connectedNumber}) berbeda dari nomor pengirim (${expectedNumber})`,
      );
    }

    console.log(
      `✅ WhatsApp client siap! Pengirim: ${connectedNumber || expectedNumber}`,
    );

    await processMessageQueue();
  });

  client.on("auth_failure", (msg) => {
    clientReady = false;
    readyResolve(false);
    console.error("❌ WhatsApp auth gagal:", msg);
  });

  client.on("disconnected", (reason) => {
    clientReady = false;
    hasQr = false;
    resetReadyPromise();
    console.warn("⚠️ WhatsApp terputus:", reason);
  });

  client.initialize().catch((err) => {
    clientReady = false;
    readyResolve(false);
    console.error("❌ Gagal inisialisasi WhatsApp:", err?.message || err);
  });

  return client;
};

const sendMessage = async (phone, message, dokumen) => {
  if (clientReady) {
    return sendMessageNow(phone, message, dokumen);
  }

  const ready = await Promise.race([
    readyPromise,
    new Promise((resolve) => setTimeout(() => resolve(false), 15000)),
  ]);

  if (ready && clientReady) {
    return sendMessageNow(phone, message, dokumen);
  }

  messageQueue.push({ phone, message, dokumen });
  console.warn(
    `⚠️ WhatsApp belum siap, pesan ke ${phone} masuk antrian (${messageQueue.length} menunggu)`,
  );
  return {
    success: false,
    error: "WhatsApp belum siap, pesan masuk antrian",
    queued: true,
  };
};

const getWaStatus = () => ({
  ready: clientReady,
  hasQr,
  senderNumber: formatWaPhone(WA_SENDER_NUMBER),
  queuedMessages: messageQueue.length,
  qrUrl: hasQr ? "/api/wa/qr" : null,
});

const getQrFilePath = () => (hasQr && fs.existsSync(QR_FILE_PATH) ? QR_FILE_PATH : null);

module.exports = {
  initWaClient,
  sendMessage,
  formatWaPhone,
  getWaStatus,
  getQrFilePath,
  getSenderNumber: () => formatWaPhone(WA_SENDER_NUMBER),
};
