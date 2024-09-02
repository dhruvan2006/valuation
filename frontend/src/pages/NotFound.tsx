import React from "react";
import { NavLink } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="mx-4 md:mx-16 pb-10">
      <div className="text-center mb-4">
        <h1 className="text-white text-4xl font-semibold mb-1">404</h1>
        <p className="text-zinc-300">Page Not Found</p>
        <NavLink to="/" className="text-indigo-500 hover:text-indigo-700 underline">Return Home</NavLink>
      </div>
    </div>
  );
}

export default NotFound;