import React, { useState, useMemo } from "react";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardView from "./components/DashboardView";
import TeamView from "./components/TeamView";
import TransactionsView from "./components/TransactionsView";
// 1. Add the import for your new component
import SwitchStpView from "./components/SwitchComponents"; 
import ReportsView from "./components/ReportsView";
import SubTasksView from "./components/SubTasksView";

import { INITIAL_AGENTS, INITIAL_TRANSACTIONS } from "./constants";
import { TransactionType } from "./types";

const App = () => {
   const [activeTab, setActiveTab] = useState("dashboard");
   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden text-[14px]">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header
          activeTab={activeTab}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {activeTab === "dashboard" && (
            <DashboardView
              // metrics={dashboardMetrics}
              // rankedAgents={[...statsByAgent].sort(
              //   (a, b) =>
              //     b.achievedSip +
              //     b.achievedLumpsum -
              //     (a.achievedSip + a.achievedLumpsum)
              // )}
              // monthlySummary={monthlySummary}
            />
          )}

          {activeTab === "team" && (
            <TeamView/>
            // <TeamView agents={agents} stats={statsByAgent} />
          )}

          {activeTab === "transactions" && (
            <TransactionsView
              // transactions={transactions}
              // agents={agents}
            />
          )}

          {/* 2. Add the conditional render for the switch_stp tab */}
          {activeTab === "switch_stp" && (
            <SwitchStpView />
          )}

          {activeTab === "subtasks" && (
            <SubTasksView
              // subTasks={subTasks}
              // agents={agents}
            />
          )}

          {activeTab === "reports" && (
            <ReportsView
              // agents={agents}
              // transactions={transactions}
            />
          )}

        </div>
      </main>
    </div>
  );
};

export default App;