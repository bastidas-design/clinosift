const nodemailer = require('nodemailer');

let transporterPromise = null;

function crearTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    // Credenciales reales configuradas en el .env (por ejemplo Gmail con contraseña de aplicación)
    return Promise.resolve(
      nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      })
    );
  }

  // Sin credenciales reales: cuenta de prueba Ethereal, generada automáticamente.
  // No envía correos de verdad, pero permite ver el correo "recibido" en un enlace de vista previa.
  return nodemailer.createTestAccount().then(function (cuenta) {
    console.log('\n[mailer] No hay SMTP_HOST/SMTP_USER/SMTP_PASS configurados en .env.');
    console.log('[mailer] Se usará una cuenta de prueba Ethereal solo para esta ejecución.');
    return nodemailer.createTransport({
      host: cuenta.smtp.host,
      port: cuenta.smtp.port,
      secure: cuenta.smtp.secure,
      auth: {
        user: cuenta.user,
        pass: cuenta.pass
      }
    });
  });
}

function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = crearTransporter();
  }
  return transporterPromise;
}

async function enviarCorreo({ to, subject, html }) {
  const transporter = await getTransporter();
  const info = await transporter.sendMail({
    from: '"ClinoSift" <no-responder@clinosift.local>',
    to: to,
    subject: subject,
    html: html
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log('\n[mailer] Correo simulado enviado. Ábrelo aquí para verlo (solo entorno de prueba):');
    console.log('[mailer] ' + previewUrl + '\n');
  }

  return info;
}

module.exports = { enviarCorreo };
