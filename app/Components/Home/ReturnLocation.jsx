"use client";

export default function ReturnLocation() {
  return (
    <div className="mt-4">
      <div className="font-semibold mb-1">Return Location</div>

      <div className="flex items-center gap-2 mb-2">
        <span>Enter Airport Code</span>
        <input className="border w-24 px-1" />
        <span className="text-blue-700 underline cursor-pointer">
          Find Airport
        </span>
      </div>

      <div className="text-red-600 font-semibold mb-2">OR</div>

      <div className="flex items-center gap-2">
        <span>Enter State</span>
        <select className="border px-2">
          <option>MA</option>
        </select>

        <span>City</span>
        <select className="border px-2">
          <option>Waltham</option>
        </select>

        <button className="border px-2 py-1">Search</button>
      </div>
    </div>
  );
}
