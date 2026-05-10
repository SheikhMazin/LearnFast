import { Link } from "react-router-dom";

function Header({ user, logout, onHistory, onHome }) {
  return (
    <div>
      <header className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-100">
        <button onClick={onHome} className=" text-xl font-bold text-blue-600">
          LearnFast
        </button>
        <div className="flex gap-15">
          <button
            className="text-sm text-gray-500 hover:text-gray-900"
            onClick={onHistory}
          >
            History
          </button>
          {user ? (
            <button
              className="text-sm text-gray-500 hover:text-gray-900"
              onClick={logout}
            >
              Logout
            </button>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </header>
    </div>
  );
}

export default Header;
