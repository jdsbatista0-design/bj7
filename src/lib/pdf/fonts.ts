import { Font } from "@react-pdf/renderer";

let registered = false;

export function ensureFonts() {
  if (registered) return;
  registered = true;
  // Barlow Condensed — display
  Font.register({
    family: "Barlow Condensed",
    fonts: [
      { src: "https://fonts.gstatic.com/s/barlowcondensed/v12/HTx3L3I-JCGChYJ8VI-L6OO_au7B6xHT.ttf", fontWeight: 400 },
      { src: "https://fonts.gstatic.com/s/barlowcondensed/v12/HTx8L3I-JCGChYJ8VI-L6OO_au7B43LT0Lo.ttf", fontWeight: 700 },
      { src: "https://fonts.gstatic.com/s/barlowcondensed/v12/HTx8L3I-JCGChYJ8VI-L6OO_au7B6BHT0Lo.ttf", fontWeight: 900 },
    ],
  });
  // Barlow — body
  Font.register({
    family: "Barlow",
    fonts: [
      { src: "https://fonts.gstatic.com/s/barlow/v12/7cHpv4kjgoGqM7E_DMs5.ttf", fontWeight: 400 },
      { src: "https://fonts.gstatic.com/s/barlow/v12/7cHqv4kjgoGqM7E3w-oc4Pg.ttf", fontWeight: 500 },
      { src: "https://fonts.gstatic.com/s/barlow/v12/7cHqv4kjgoGqM7E3_-kc4Pg.ttf", fontWeight: 700 },
    ],
  });
}