import Header from "./Components/Header";
import DateTimePicker from "./Components/Home/DateTimePicker";
import PickupLocation from "./Components/Home/PickupLocation";
import ReturnLocation from "./Components/Home/ReturnLocation";

export default function Home() {
  return (
    <main>
      <Header />

      <div className="flex gap-6 p-6">
        {/* LEFT */}
        <div className="border p-4 w-2/3">
          <h2 className="font-bold mb-4">Make Reservation</h2>

          <div className="flex gap-8 mb-4">
            <DateTimePicker label="Rental Date & Time" />
            <DateTimePicker label="Return Date & Time" />
          </div>

          <PickupLocation />

          <div className="my-3">
            <label>
              <input type="checkbox" /> I may return the car to different location
            </label>
          </div>

          <ReturnLocation />

          <div className="mt-6 text-center">
            <button className="border px-6 py-2">
              Continue Booking
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="border p-4 w-1/3 h-[420px]">
          <p>
            This area will be used to display deals, special offers,
            “For sale” Ads, Partner’s Ads, etc.
          </p>
        </div>
      </div>
    </main>
  );
}
