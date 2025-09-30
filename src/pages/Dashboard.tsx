import LastTransaction from "../components/LastTransaction";
import DonutChart from "../components/DonutChart";
const Dashboard = () => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 text-black">Dashboard</h2>
      {/* Donut Chart */}
      <div>
        <DonutChart />
      </div>
      {/* Recent Transactions */}
      <div className="last-transactions mt-8">
        <h3 className="text-lg font-semibold mb-4 text-black">
          Recent Transactions
        </h3>
        <LastTransaction />
      </div>
    </div>
  );
};

export default Dashboard;
