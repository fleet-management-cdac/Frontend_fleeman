"use client";

export default function DateTimePicker({ label }) {
  return (
    <div>
      <div className="font-semibold mb-1">{label}</div>

      {/* Calendar */}
      <input
        type="date"
        className="border px-2 py-1 mb-2 w-full"
      />

      {/* Time */}
      <div className="flex items-center gap-2">
        <select className="border px-2">
          {[...Array(12)].map((_, i) => (
            <option key={i}>{i + 1}</option>
          ))}
        </select>

        <select className="border px-2">
          <option>00</option>
          <option>15</option>
          <option>30</option>
          <option>45</option>
        </select>

        <label>
          <input type="radio" name={label} /> AM
        </label>
        <label>
          <input type="radio" name={label} /> PM
        </label>
      </div>
    </div>
  );
}
