import { Link } from "react-router-dom";

function Header() {
  return (
    <div>
      <header className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-100">
        <Link className=" text-xl font-bold text-blue-600" to="/">
          LearnFast
        </Link>
        <Link className="text-sm text-gray-500 hover:text-gray-900" to="/login">
          Login
        </Link>
      </header>
    </div>
  );
}

export default Header;
