import "dotenv/config";
import createError from "http-errors";
import fs from "fs";
import { registerFont, createCanvas, loadImage } from "canvas";
import customDate from "./formatDate.js";

// Load fonts for canvas
// *** windows must use font already install on system ***
registerFont("templates/fonts/THSarabun Bold.ttf", { family: "Bold" });
registerFont("templates/fonts/THSarabun.ttf", { family: "Normal" });

const drawCertificate = async (certificateJson) => {
  try {
    const certificate = JSON.parse(certificateJson);
    const layout = JSON.parse(fs.readFileSync(`templates/${certificate.layoutId}.json`));

    const imageTemplate = await loadImage(`templates/${layout.template}`);
    const canvas = createCanvas(imageTemplate.width, imageTemplate.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imageTemplate, 0, 0);

    for (let i = 0; i < layout.images.length; i++) {
      const img = await loadImage(`templates/${layout.images[i].image}`);
      ctx.drawImage(
        img,
        layout.images[i].x,
        layout.images[i].y,
        layout.images[i].width,
        layout.images[i].height
      );
    }

    for (let j = 0; j < layout.texts.length; j++) {
      ctx.font = `${layout.texts[j].fontsize}px "${layout.texts[j].font}"`;
      ctx.textAlign = layout.texts[j].align;

      let textString;
      for (let k = 0; k < layout.texts[j].text.length; k++) {
        textString = textString
          ? textString + " " + certificate[layout.texts[j].text[k].field]
          : certificate[layout.texts[j].text[k].field];
      }

      if (layout.texts[j].dateformat) {
        textString = customDate.dateFormat(
          textString,
          layout.texts[j].dateformat.format,
          layout.texts[j].dateformat.locale
        );
      }

      ctx.fillText(textString, layout.texts[j].x, layout.texts[j].y);
    }
    return canvas;
  } catch (error) {
    console.log("==== drawCertificate ====\n", error);
    throw createError(500, "draw image Error");
  }
};

export default drawCertificate;
