// קומפוננטה להצגת תוצאות החישוב ופירוט הימים בצורה מעוצבת
const ResultsDisplay = ({ result }) => {
  return (
    <div className="mt-8">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 shadow-lg">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">
          תוצאות החישוב
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-gray-700 font-medium">
              סה"כ פעימות מתחילת החודש:{" "}
              <span className="font-bold text-blue-600 ml-2">
                {result.totalMonthPulses}
              </span>
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-gray-700 font-medium">
              מחיר לפעימה:{" "}
              <span className="font-bold text-blue-600 ml-2">
                {result.pricePerPulse} ש"ח
              </span>
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-gray-700 font-medium">
              פעימות מתחילת החודש עד תאריך ההתחלה:{" "}
              <span className="font-bold text-blue-600 ml-2">
                {result.period1.pulses}
              </span>
            </p>
            <p className="text-gray-700 font-medium mt-1">
              עלות לתקופה זו:{" "}
              <span className="font-bold text-blue-600 ml-2">
                {result.period1.cost} ש"ח
              </span>
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-gray-700 font-medium">
              פעימות מיום למחרת עד תאריך הסיום:{" "}
              <span className="font-bold text-blue-600 ml-2">
                {result.period2.pulses}
              </span>
            </p>
            <p className="text-gray-700 font-medium mt-1">
              עלות לתקופה זו:{" "}
              <span className="font-bold text-blue-600 ml-2">
                {result.period2.cost} ש"ח
              </span>
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-gray-700 font-medium">
              מספר הימים שנבחרו:{" "}
              <span className="font-bold text-blue-600 ml-2">
                {result.selectedDaysCount}
              </span>
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-gray-700 font-medium">
              ימים שחלפו מתחילת החודש:{" "}
              <span className="font-bold text-blue-600 ml-2">
                {result.daysPassedCount}
              </span>
            </p>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-4">פירוט ימים</h3>
      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-4 text-right sticky top-0 bg-blue-600">תאריך</th>
              <th className="p-4 text-right sticky top-0 bg-blue-600">
                סוג יום
              </th>
              <th className="p-4 text-right sticky top-0 bg-blue-600">
                פעימות
              </th>
              <th className="p-4 text-right sticky top-0 bg-blue-600">
                עלות (ש"ח)
              </th>
            </tr>
          </thead>
          <tbody>
            {result.days.map((day, index) => (
              <tr
                key={index}
                className="bg-white hover:bg-blue-50 transition-colors border-b border-gray-200"
              >
                <td className="py-4 px-2 text-right">
                  <div className="flex flex-col">
                    <div>{day.date}</div>
                    <div>{day.gregDate}</div>
                  </div>
                </td>
                <td className="py-4 px-2 text-right">
                  {day.isSaturday && " שבת"}
                  {day.isYomTov && " יום טוב"}
                  {day.isFriday && " שישי"}
                  {day.isHolidayEve && (day.isFriday ? " + ערב חג" : " ערב חג")}
                  {day.isCholHaMoed && " חול המועד"}
                  {!day.isSaturday &&
                    !day.isYomTov &&
                    !day.isFriday &&
                    !day.isHolidayEve &&
                    !day.isCholHaMoed &&
                    " רגיל"}
                </td>
                <td className="py-4 px-2 text-center text-gray-800 font-medium">
                  {day.pulses}
                </td>
                <td className="py-4 px-2 text-center text-gray-800 font-medium">
                  {day.cost}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsDisplay;
