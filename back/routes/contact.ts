import { Router, Request, Response } from "express";
import nodemailer from "nodemailer";

const router = Router();

// POST /api/contact — validate + send the contact email.
router.post("/", async (req: Request, res: Response) => {
  const { name, email, phone, subject, message, website } = req.body || {};

  // Honeypot: bots fill the hidden "website" field. Pretend success, do nothing.
  if (website) {
    res.status(200).json({ ok: true });
    return;
  }

  if (!name || !email || !message) {
    res.status(400).json({ error: "Veuillez remplir les champs obligatoires." });
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"2M ARCHI — Site web" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_TO_EMAIL,
      replyTo: email,
      subject: `Nouveau message — ${subject || "Demande de contact"}`,
      text: [
        `Nom : ${name}`,
        `Email : ${email}`,
        `Téléphone : ${phone || "—"}`,
        `Sujet : ${subject || "—"}`,
        "",
        message,
      ].join("\n"),
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "L'envoi du message a échoué. Veuillez réessayer." });
  }
});

export default router;
