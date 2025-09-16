import React from "react";

function SideBar() {
  return (
    <>
      <div className="col-span-3 bg-bg p-4">
        <h2 className="text-income text-xl font-bold mb-4">LOGO</h2>
        <ul className="space-y-2">
          <link className="text-[var(--color-navBar-text)] hover:text-white cursor-pointer">
            Dashboard
          </link>
          <li className="text-[var(--color-navBar-text)] hover:text-white cursor-pointer">
            Transactions
          </li>
          <li className="text-[var(--color-navBar-text)] hover:text-white cursor-pointer">
            Settings
          </li>
        </ul>
      </div>
    </>
  );
}

export default SideBar;
