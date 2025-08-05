/* =================================================================
 * CREATE THIS NEW FILE
 * PATH: frontend-web/src/pages/HomePage.tsx
 * This is a placeholder for your future public-facing website.
 * ================================================================= */
import React from "react";
import { Link } from "react-router-dom";

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800">
        Welcome to Our Restaurant
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        Our official website is coming soon!
      </p>
      <Link
        to="/login"
        className="px-6 py-3 mt-8 text-lg font-semibold text-white bg-indigo-600 rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Go to App Login
      </Link>
    </div>
  );
};

export default HomePage;
