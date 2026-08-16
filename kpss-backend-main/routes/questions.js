/* ==========================================================================
   routes/questions.js
   - GET  /api/questions             → soru havuzundan rastgele/filtreli sorular
   - POST /api/questions            → kullanıcı kendi sorusunu ekler
   - GET  /api/questions/mine       → kullanıcının kendi eklediği sorular
   - POST /api/questions/wrong      → yanlış yapılan soruyu kaydet
   - GET  /api/questions/wrong      → kullanıcının yanlış listesini getir
   - POST /api/questions/report     → hatalı soru bildir
   ========================================================================== */

const express = require("express");
const { nanoid } = require("nanoid");
const db = require("../db/db");

const router = express.Router();

function userIdAl(req, res) {
  const userId = req.header("X-User-Id");
  if (!userId) {
    res.status(400).json({ hata: "X-User-Id header eksik." });
    return null;
  }
  return userId;
}

// Mevcut soruların basit listesi.
router.get("/", (req, res) => {
  const userId = userIdAl(req, res);
  if (!userId) return;
  const limit = Math.min(50, Math.max(1, Number(req.query.sayi) || 20));
  const sorular = db.prepare("SELECT * FROM questions ORDER BY created_at DESC LIMIT ?").all(limit);
  res.set("Cache-Control", "no-store");
  res.json({ sorular: sorular.map(satirCevir) });
});

// Kalıcı soru havuzu: filtreli ve rastgele seçim.
router.get("/pool", (req, res) => {
  const ders = String(req.query.ders || "tumu");
  const konu = String(req.query.konu || "tumu");
  const zorluk = String(req.query.zorluk || "tumu");
  const sayi = Math.min(40, Math.max(1, Number(req.query.sayi) || 10));

  let sql = "SELECT * FROM questions WHERE 1=1";
  const params = [];

  if (ders !== "tumu") {
    sql += " AND subject = ?";
    params.push(ders);
  }
  if (konu !== "tumu") {
    sql += " AND topic = ?";
    params.push(konu);
  }
  if (zorluk !== "tumu") {
    sql += " AND difficulty = ?";
    params.push(zorluk);
  }

  sql += " ORDER BY RANDOM() LIMIT ?";
  params.push(sayi);

  const sorular = db.prepare(sql).all(...params);
  res.set("Cache-Control", "no-store");
  res.json({
    sorular: sorular.map(satirCevir),
    filtreler: { ders, konu, zorluk, sayi }
  });
});

router.post("/", (req, res) => {
  const userId = userIdAl(req, res);
  if (!userId) return;

  const { subject, topic, question, options, correctAnswer, explanation, difficulty } = req.body;
  if (!subject || !question || !options || !correctAnswer) {
    return res.status(400).json({ hata: "Ders, soru, şıklar ve doğru cevap zorunludur." });
  }

  const id = nanoid();
  db.prepare(`INSERT INTO questions (id, subject, topic, question, options, correct_answer, explanation, difficulty, source, created_by)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'user', ?)`).run(
    id, subject, topic || "", question, JSON.stringify(options), correctAnswer, explanation || "", difficulty || "orta", userId
  );

  res.json({ id });
});

router.get("/mine", (req, res) => {
  const userId = userIdAl(req, res);
  if (!userId) return;
  const sorular = db.prepare("SELECT * FROM questions WHERE created_by = ? ORDER BY created_at DESC").all(userId);
  res.json({ sorular: sorular.map(satirCevir) });
});

router.post("/wrong", (req, res) => {
  const userId = userIdAl(req, res);
  if (!userId) return;
  const { questionId, verilenCevap } = req.body;
  if (!questionId) return res.status(400).json({ hata: "questionId zorunlu." });

  db.prepare("INSERT INTO wrong_questions (id, user_id, question_id, verilen_cevap) VALUES (?, ?, ?, ?)").run(
    nanoid(), userId, questionId, verilenCevap || null
  );
  res.json({ ok: true });
});

router.get("/wrong", (req, res) => {
  const userId = userIdAl(req, res);
  if (!userId) return;

  const kayitlar = db.prepare(`
    SELECT wq.id AS wrong_id, wq.verilen_cevap, wq.created_at AS wrong_at, q.*
    FROM wrong_questions wq
    JOIN questions q ON q.id = wq.question_id
    WHERE wq.user_id = ?
    ORDER BY wq.created_at DESC
  `).all(userId);

  res.json({
    yanlislar: kayitlar.map(k => ({
      id: k.wrong_id,
      soru: satirCevir(k),
      verilenCevap: k.verilen_cevap,
      tarih: k.wrong_at
    }))
  });
});

router.post("/report", (req, res) => {
  const userId = userIdAl(req, res);
  if (!userId) return;
  const { questionId, sebep } = req.body;
  if (!questionId) return res.status(400).json({ hata: "questionId zorunludur." });

  db.prepare("INSERT INTO reported_questions (id, question_id, user_id, sebep) VALUES (?, ?, ?, ?)").run(
    nanoid(), questionId, userId, sebep || ""
  );
  res.json({ ok: true });
});

function satirCevir(q) {
  return {
    id: q.id,
    subject: q.subject,
    topic: q.topic,
    question: q.question,
    options: JSON.parse(q.options || "{}"),
    correctAnswer: q.correct_answer,
    explanation: q.explanation,
    difficulty: q.difficulty,
    source: q.source,
    createdAt: q.created_at
  };
}

module.exports = router;
