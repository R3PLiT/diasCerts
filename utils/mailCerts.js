import "dotenv/config";
import createError from "http-errors";
import nodemailer from "nodemailer";

const mailCertificates = async (details) => {
  try {
    const transporter = nodemailer.createTransport({
      pool: true,
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true" ? true : false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const hostURL = process.env.HOST_URL;
    let accepted = 0;
    let rejected = 0;

    for (const detail of details) {
      const { certificateUUID, recipientEmail, recipientName, courseName, instituteName } = detail;

      const certificateLink = `${hostURL}/certificates/${certificateUUID}`;
      const certificateimageLink = `${hostURL}/certificates/${certificateUUID}/image`;

      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: recipientEmail,
        subject: "จัดส่งประกาศนียบัตร",
        html: `
        <p>เรียน ${recipientName},</p>
        <p>คุณได้รับประกาศนียบัตรจาก ${instituteName} สำหรับหลักสูตร ${courseName}</p>
        <p>สามารถดาวน์โหลดได้ตามลิงค์ด้านล่างนี้:</p>
        <p><a href="${certificateLink}" target="_blank">ไฟล์ประกาศนียบัตร</a> (ใช้ตรวจสอบความถูกต้อง)</p>   
        <p><a href="${certificateimageLink}" target="_blank">รูปภาพประกาศนียบัตร</a></p>
        <p>ขอแสดงความยินดี,<br>diasCerts</p>
      `,
      };
      const info = await transporter.sendMail(mailOptions);

      accepted += info.accepted.length;
      rejected += info.rejected.length;
    }

    transporter.close();

    return { accepted, rejected };
  } catch (error) {
    console.error("==== mailCertificates ====\n", error);
    // throw createError(500, "send mail Error");
    throw createError(500);
  }
};

export default mailCertificates;
