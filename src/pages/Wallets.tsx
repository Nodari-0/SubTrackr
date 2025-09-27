import AllSubscribtions from "../components/AllSubscribtions";
import LimitsByCategory from "../components/LimitsByCategory";
import Transactions from "../components/Transactions";

function Wallets() {
  return (
    <div className="flex flex-col lg:flex-row max-w-7xl mx-auto sm:px-6 lg:px-8 w-full gap-6 text-black">
      {/* Transactions */}
      <div className="w-full lg:w-1/2">
        <Transactions />
      </div>

      {/* Subscriptions & Limits */}
      <div className="w-full lg:w-1/2 flex flex-col gap-6">
        <AllSubscribtions />
        <LimitsByCategory />
      </div>
    </div>
  );
}

export default Wallets;
