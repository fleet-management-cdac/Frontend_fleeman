"use client";

export default function Header() {
  return (
    <header className="border border-black">
      {/* Banner */}
      <div className="flex justify-between items-center px-6 py-3">
        <div className="text-xl font-bold">
          Rent-a-Car
        </div>
        <div className="text-blue-700 font-semibold">
          Book Online or call 1-800-DRIVE
        </div>
      </div>

      {/* Login row */}
      <div className="text-center py-1 border-t border-b">
        <span className="text-blue-700 font-semibold cursor-pointer">
          Login
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex gap-3 px-6 py-2 text-sm">
        <button className="border px-3 py-1">HOME</button>
        <button className="border px-3 py-1">Modify / Cancel</button>
        <button className="border px-3 py-1">Membership Registration</button>
        <button className="border px-3 py-1">About India Drive</button>
        <button className="border px-3 py-1">Customer Care</button>
      </nav>
    </header>
  );
}
