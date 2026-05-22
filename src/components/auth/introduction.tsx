import { Link } from "react-router-dom";

export default function Introduction() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to My System
        </h1>
        <p className="text-gray-600 mb-6">
          This is a simple introduction page built with React, TypeScript, and TailwindCSS.
          You can customize it to explain your systems purpose.
        </p>
        <Link
          to="/login"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}
