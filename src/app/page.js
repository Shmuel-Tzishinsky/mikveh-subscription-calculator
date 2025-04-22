"use client";

import { useState, useEffect, useRef } from "react";
import { HDate, HebrewCalendar } from "@hebcal/core";
import { ReactJewishDatePicker } from "react-jewish-datepicker";
import "react-jewish-datepicker/dist/index.css";
import "./globals.css";
import ResultsDisplay from "@/components/ResultsDisplay";
import {
  numberToDay,
  numberToHebrew,
  hebrewYearToLetters,
} from "@/utils/hebrewUtils";

// עמוד ראשי לחישוב מנוי חודשי של מקווה
export default function Home() {
  // אתחול תאריכים ושמירת מצב
  const today = new HDate();
  const nextMonthFirstDay = new HDate(
    1,
    today.getMonth() + 1,
    today.getFullYear()
  );
  const [dateRange, setDateRange] = useState({
    startDate: {
      day: today.getDate(),
      monthName: today.getMonthName(),
      year: today.getFullYear(),
    },
    endDate: {
      day: nextMonthFirstDay.getDate(),
      monthName: nextMonthFirstDay.getMonthName(),
      year: nextMonthFirstDay.getFullYear(),
    },
  });

  const [subscriptionPrice, setSubscriptionPrice] = useState("130");
  const [result, setResult] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const datePickerRef = useRef(null);
  const subscriptionPriceRef = useRef(null);
  const calculateButtonRef = useRef(null);

  // בדיקה אם זו הכניסה הראשונה להצגת מודל הסבר
  useEffect(() => {
    const hasSeenIntro = localStorage.getItem("hasSeenIntro");
    if (!hasSeenIntro) {
      setShowIntroModal(true);
    }
  }, []);

  // האזנה לאירוע BeforeInstallPromptEvent עבור התקנת PWA
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("SW registered", reg))
        .catch((err) => console.error("SW registration failed", err));
    }
  }, []);

  // פונקציה להתקנת האפליקציה
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  // סגירת מודל ההסבר והתחלת תהליך ההדרכה
  const closeIntroModal = () => {
    setShowIntroModal(false);
    setTourStep(1); // התחל את ההדרכה מהצעד הראשון
  };

  // דילוג על תהליך ההדרכה
  const skipTour = () => {
    setTourStep(0);
    localStorage.setItem("hasSeenIntro", "true");
  };

  // מעבר לצעד הבא בהדרכה
  const nextTourStep = () => {
    if (tourStep < 3) {
      setTourStep(tourStep + 1);
    } else {
      setTourStep(0);
      localStorage.setItem("hasSeenIntro", "true");
    }
  };

  // הגדרת צעדי ההדרכה
  const tourSteps = [
    {
      target: datePickerRef,
      content: "בחר כאן את טווח התאריכים העבריים עבור החישוב.",
      position: "bottom",
    },
    {
      target: subscriptionPriceRef,
      content: "הזן או בחר את מחיר המנוי החודשי.",
      position: "bottom",
    },
    {
      target: calculateButtonRef,
      content: "לחץ כאן כדי לחשב את עלות המנוי עבור התקופה שנבחרה.",
      position: "bottom",
    },
  ];

  // חישוב פעימות עבור טווח התאריכים שנבחר
  const calculatePulses = () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      console.log("No start or end date selected");
      return;
    }

    const startHebrewDate = new HDate(
      dateRange.startDate.day,
      dateRange.startDate.monthName,
      dateRange.startDate.year
    );
    const endHebrewDate = new HDate(
      dateRange.endDate.day,
      dateRange.endDate.monthName,
      dateRange.endDate.year
    );

    const firstDayOfMonth = new HDate(
      1,
      startHebrewDate.getMonth(),
      startHebrewDate.getFullYear()
    );
    const dayAfterStart = new HDate(startHebrewDate).next();
    const nextMonth =
      startHebrewDate.getMonth() === 12 ? 1 : startHebrewDate.getMonth() + 1;
    const nextYear =
      startHebrewDate.getMonth() === 12
        ? startHebrewDate.getFullYear() + 1
        : startHebrewDate.getFullYear();
    const firstDayOfNextMonth = endHebrewDate;
    const lastDayOfMonth = firstDayOfNextMonth.prev();

    // חישוב מספר הימים שנבחרו וימים שחלפו
    let selectedDaysCount = 0;
    let daysPassedCount = 0;
    let tempDate = new HDate(startHebrewDate);
    while (!tempDate.isSameDate(endHebrewDate)) {
      selectedDaysCount++;
      tempDate = tempDate.next();
    }
    selectedDaysCount++; // כולל את יום הסיום
    tempDate = new HDate(firstDayOfMonth);
    while (!tempDate.isSameDate(startHebrewDate)) {
      daysPassedCount++;
      tempDate = tempDate.next();
    }

    let totalMonthPulses = 0;
    let days = [];
    let currentDate = new HDate(firstDayOfMonth);

    while (true) {
      const gregDate = currentDate.greg();
      const dayOfWeek = gregDate.getDay();
      const isSaturday = dayOfWeek === 6;
      const isFriday = dayOfWeek === 5;
      const holidays =
        HebrewCalendar.getHolidaysOnDate(currentDate, true) || [];

      const isYomTov = holidays.some((h) => {
        const descEn = h.getDesc("en");
        const descHe = h.getDesc("he");
        return (
          (descEn.includes("Rosh Hashanah") ||
            (descEn.includes("Yom Kippur") && !descEn.includes("Katan")) ||
            descEn.includes("Shavuot") ||
            descEn === "Pesach I" ||
            descEn.includes("Pesach VII") ||
            descEn.includes("Sukkot I") ||
            descEn.includes("Shmini Atzeret") ||
            descEn.includes("Simchat Torah")) &&
          !descEn.includes("Chol HaMoed") &&
          !descHe.includes("חול המועד")
        );
      });

      const isHolidayEve = holidays.some(
        (h) =>
          h.getDesc("en").includes("Erev") ||
          h.getDesc("he").includes("ערב") ||
          h.getDesc("he").includes("Hoshana Raba")
      );

      const isCholHaMoed = holidays.some(
        (h) =>
          h.getDesc("en").includes("Chol HaMoed") ||
          h.getDesc("he").includes("חול המועד")
      );

      let dayPulses = 1;
      if (isSaturday || isYomTov) {
        dayPulses = 0;
      } else if (isFriday || isHolidayEve) {
        dayPulses = 2;
      }

      totalMonthPulses += dayPulses;
      const d = numberToHebrew(currentDate.getDate());
      const m = currentDate.render("he", false).replace(/^\d+\s*/, "");
      const y = hebrewYearToLetters(currentDate.getFullYear());

      days.push({
        date: `${numberToDay(currentDate.getDay())}, ${d} ב${m} ${y}`,
        gregDate: gregDate.toLocaleDateString("he-IL"),
        pulses: dayPulses,
        isFriday,
        isHolidayEve,
        isSaturday,
        isYomTov,
        isCholHaMoed,
        hDate: new HDate(currentDate),
      });

      if (currentDate.isSameDate(firstDayOfNextMonth)) {
        break;
      }
      currentDate = currentDate.next();
    }

    const subscriptionPriceValue = Number(subscriptionPrice);
    const pricePerPulse =
      totalMonthPulses > 0 ? subscriptionPriceValue / totalMonthPulses : 0;

    let period1Pulses = 0;
    for (let day of days) {
      const dayGreg = day.hDate.greg();
      const startGreg = startHebrewDate.greg();
      if (day.hDate.isSameDate(startHebrewDate) || dayGreg < startGreg) {
        period1Pulses += day.pulses;
      }
    }
    const period1Cost = period1Pulses * pricePerPulse;

    let period2Pulses = 0;
    for (let day of days) {
      const dayGreg = day.hDate.greg();
      const dayAfterStartGreg = dayAfterStart.greg();
      const endGreg = endHebrewDate.greg();
      const isAfterDayAfterStart =
        day.hDate.isSameDate(dayAfterStart) || dayGreg > dayAfterStartGreg;
      const isBeforeOrSameEndDate =
        day.hDate.isSameDate(endHebrewDate) || dayGreg < endGreg;
      if (isAfterDayAfterStart && isBeforeOrSameEndDate) {
        period2Pulses += day.pulses;
      }
    }
    const period2Cost = period2Pulses * pricePerPulse;

    days = days.map((day) => ({
      ...day,
      cost: (day.pulses * pricePerPulse).toFixed(2),
    }));

    setResult({
      totalMonthPulses,
      pricePerPulse: pricePerPulse.toFixed(2),
      period1: { pulses: period1Pulses, cost: period1Cost.toFixed(2) },
      period2: { pulses: period2Pulses, cost: period2Cost.toFixed(2) },
      days,
      selectedDaysCount,
      daysPassedCount,
    });
  };

  // ניקוי התוצאות והטווח שנבחר
  const clearResults = () => {
    setResult(null);
    setDateRange({
      startDate: undefined,
      endDate: undefined,
    });
  };

  // רינדור מודל ההדרכה הצף
  const renderTourModal = () => {
    if (tourStep === 0) return null;
    const step = tourSteps[tourStep - 1];
    const targetRef = step.target.current;
    if (!targetRef) return null;

    const rect = targetRef.getBoundingClientRect();
    const positionStyle =
      step.position === "bottom"
        ? {
            top: rect.bottom + window.scrollY + 10,
            left: rect.left + window.scrollX,
          }
        : {
            bottom: window.innerHeight - rect.top + window.scrollY + 10,
            left: rect.left + window.scrollX,
          };

    return (
      <div
        className="fixed bg-white rounded-lg p-4 shadow-2xl z-50 max-w-sm"
        style={positionStyle}
      >
        <p className="text-gray-700 mb-4">{step.content}</p>
        <div className="flex justify-between">
          <button
            onClick={skipTour}
            className="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg hover:bg-gray-300 transition-all"
          >
            דלג
          </button>
          <button
            onClick={nextTourStep}
            className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-all"
          >
            {tourStep === 3 ? "סיים" : "הבא"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col items-center justify-center py-6 px-4">
      {/* מודל הסבר למשתמש חדש */}
      {showIntroModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-gray-100  bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold text-blue-700 mb-4">
              ברוכים הבאים למערכת לחישוב מנוי חודשי למקווה!
            </h2>
            <p className="text-gray-700 mb-4">
              אפליקציה זו מחשבת את עלות המנוי החודשי למקווה על בסיס תאריכים
              עבריים. בחרו טווח תאריכים ומחיר מנוי, והאפליקציה תחשב את מספר
              הפעימות (יחידות עלות) עבור התקופה.
            </p>
            <div className="text-gray-700 mb-4">
              <strong>איך החישוב עובד?</strong>
              <br />
              - החישוב מתחיל תמיד מהיום הראשון של החודש העברי.
              <br />
              - התקופה הראשונה כוללת פעימות מהיום הראשון של החודש ועד תאריך
              ההתחלה שבחרתם.
              <br />
              - התקופה השנייה כוללת פעימות מהיום שלמחרת תאריך ההתחלה ועד תאריך
              הסיום שבחרתם.
              <br />- חוקי הפעימות:
              <ul className="list-disc pr-5">
                <li>יום רגיל = 1 פעימה</li>
                <li>שישי או ערב חג = 2 פעימות</li>
                <li>שבת או יום טוב = 0 פעימות</li>
              </ul>
              <br />
              המחיר הכולל של המנוי מחולק לפי מספר הפעימות בחודש, והתוצאה מראה את
              העלות עבור התקופה שבחרתם.
            </div>
            <button
              onClick={closeIntroModal}
              className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 shadow-md transition-all duration-300"
            >
              התחל הדרכה
            </button>
          </div>
        </div>
      )}

      {/* מודל הדרכה צף */}
      {renderTourModal()}

      <div className="bg-white shadow-2xl rounded-xl p-4 max-w-3xl w-full">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">
          מחשבון למנוי חודשי למקווה
        </h1>

        {/* התראה להתקנת האפליקציה כ-PWA */}
        {showInstallPrompt && (
          <div className="mb-6 p-4 bg-blue-100 text-blue-800 rounded-lg flex justify-between items-center">
            <p>התקן את האפליקציה לשימוש נוח יותר!</p>
            <button
              onClick={handleInstallClick}
              className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-300"
            >
              התקן עכשיו
            </button>
          </div>
        )}

        <div className="mb-6" ref={datePickerRef}>
          <label className="block text-gray-800 font-semibold mb-2">
            בחר טווח תאריכים
          </label>
          <ReactJewishDatePicker
            value={dateRange}
            isHebrew
            isRange={true}
            onClick={(startDay, endDay) => {
              setDateRange({
                startDate: startDay.jewishDate,
                endDate: endDay.jewishDate,
              });
            }}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-shadow"
          />
        </div>
        <div className="mb-6" ref={subscriptionPriceRef}>
          <label className="block text-gray-800 font-semibold mb-2">
            מחיר מנוי
          </label>
          <div className="flex space-x-4 mb-3">
            <button
              className={`flex-1 py-3 px-4 rounded-lg font-medium shadow-md transition-all duration-300 transform hover:scale-105 ${
                subscriptionPrice === "130"
                  ? "bg-blue-600 text-white shadow-blue-500/50"
                  : "bg-gray-100 text-blue-600 hover:bg-blue-50"
              }`}
              onClick={() => setSubscriptionPrice("130")}
            >
              נשוי (130 ש"ח לחודש)
            </button>
            <button
              className={`flex-1 py-3 px-4 rounded-lg font-medium shadow-md transition-all duration-300 transform hover:scale-105 ${
                subscriptionPrice === "95"
                  ? "bg-blue-600 text-white shadow-blue-500/50"
                  : "bg-gray-100 text-blue-600 hover:bg-blue-50"
              }`}
              onClick={() => setSubscriptionPrice("95")}
            >
              בחור (95 ש"ח לחודש)
            </button>
          </div>
          <input
            type="number"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-shadow"
            value={subscriptionPrice}
            placeholder="מחיר מנוי"
            pattern="^[0-9]*$"
            onChange={(e) => setSubscriptionPrice(e.target.value)}
          />
        </div>
        <div className="flex space-x-4">
          <button
            onClick={clearResults}
            className="flex-1 bg-gray-200 text-gray-800 font-medium py-3 rounded-lg hover:bg-gray-300 shadow-md transition-all duration-300 transform hover:scale-105"
          >
            נקה
          </button>
          <button
            onClick={calculatePulses}
            className="flex-1 bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 shadow-md transition-all duration-300 transform hover:scale-105"
            ref={calculateButtonRef}
          >
            חשב
          </button>
        </div>

        {result && <ResultsDisplay result={result} />}
      </div>
    </div>
  );
}
