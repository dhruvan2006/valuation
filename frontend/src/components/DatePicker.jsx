const DatePicker = ({ label, selectedDate, onChange }) => {
  return (
    <div className="flex flex-col gap-y-2 flex-1 w-full">
      <label className="text-white ml-1 text-sm">{label}</label>
      <div className="relative">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-2 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500"
        />
      </div>
    </div>
  );
}

export default DatePicker;