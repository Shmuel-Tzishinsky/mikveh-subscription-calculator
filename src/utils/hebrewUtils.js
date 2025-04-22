function numberToHebrew(n) {
  // המרת מספר לספרות עבריות עם גרשיים
  const letters = [
    ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"],
    ["", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"],
    ["", "ק", "ר", "ש", "ת"],
  ];

  let result = "";
  const hundreds = Math.floor(n / 100);
  const tens = Math.floor((n % 100) / 10);
  const ones = n % 10;

  if (hundreds) result += letters[2][hundreds];
  if (tens === 1 && (ones === 5 || ones === 6)) {
    result += ones === 5 ? "טו" : "טז";
  } else {
    if (tens) result += letters[1][tens];
    if (ones) result += letters[0][ones];
  }

  if (result.length >= 2) {
    return result.slice(0, -1) + "״" + result.slice(-1);
  } else {
    return result + "׳";
  }
}

function numberToDay(n) {
  // המרת מספר יום בשבוע לשם היום בעברית
  const days = {
    1: "ראשון",
    2: "שני",
    3: "שלישי",
    4: "רביעי",
    5: "חמישי",
    6: "שישי",
    0: "שבת",
  };
  return days[n];
}

function hebrewYearToLetters(year) {
  // המרת שנה עברית לסימון גימטרי (למשל, תשפ"ה)
  const gematria = {
    1: "א",
    2: "ב",
    3: "ג",
    4: "ד",
    5: "ה",
    6: "ו",
    7: "ז",
    8: "ח",
    9: "ט",
    10: "י",
    20: "כ",
    30: "ל",
    40: "מ",
    50: "נ",
    60: "ס",
    70: "ע",
    80: "פ",
    90: "צ",
    100: "ק",
    200: "ר",
    300: "ש",
    400: "ת",
  };

  let letters = "";
  let n = year % 1000;

  const specialCases = { 15: "טו", 16: "טז" };
  if (specialCases[n])
    return "ה" + specialCases[n].slice(0, -1) + "״" + specialCases[n].slice(-1);

  const parts = [];
  const keys = Object.keys(gematria)
    .map(Number)
    .sort((a, b) => b - a);

  for (let key of keys) {
    while (n >= key) {
      parts.push(gematria[key]);
      n -= key;
    }
  }

  if (parts.length >= 2) {
    letters = parts.slice(0, -1).join("") + "״" + parts.slice(-1);
  } else {
    letters = "״" + parts.join("");
  }

  return "ה" + letters;
}

export { numberToHebrew, numberToDay, hebrewYearToLetters };
