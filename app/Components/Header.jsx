"use client";

import { useEffect, useState } from "react";

export default function Header() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <header className="border border-black">
      <div className="flex justify-between items-center px-6 py-3">
        <div className="text-xl font-bold">FLEMAN</div>
        <div className="text-blue-700 font-semibold">
          Book Online or call 1-800-FLEMAN
        </div>
      </div>

      <div className="text-center py-1 border-t border-b">
        <span className="text-blue-700 font-semibold cursor-pointer">
          Login
        </span>
      </div>

      <nav className="flex gap-3 px-6 py-2 text-sm">
        <button type="button" className="border px-3 py-1">HOME</button>
        <button type="button" className="border px-3 py-1">Modify / Cancel</button>
        <button type="button" className="border px-3 py-1">Membership Registration</button>
        <button type="button" className="border px-3 py-1">About India Drive</button>
        <button type="button" className="border px-3 py-1">Customer Care</button>
      </nav>
    </header>
  );
}
