import { useEffect, useState } from "react";
import { getHistory } from "../api/client";
import Header from "../components/Header";

function HistoryPage({ sessionId, user, logout, onHistory, onHome }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    async function fetchHistory() {
      if (!sessionId) return;
      try {
        const data = await getHistory(sessionId);
        setHistory(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        user={user}
        logout={logout}
        onHistory={onHistory}
        onHome={onHome}
      />
      <div className="px-6 py-8 max-w-xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">History</h1>
        {history.length === 0 ? (
          <p className="text-gray-400">No history yet.</p>
        ) : (
          history.map((entry, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-100 p-4 mb-3"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-blue-600 uppercase">
                  {entry.type}
                </span>
                <span className="text-xs text-gray-400">{entry.topic}</span>
              </div>
              <p className="text-sm text-gray-700">
                {JSON.stringify(entry.content)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default HistoryPage;
