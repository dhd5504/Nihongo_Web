import React from "react";

const Fetching = () => {
  return (
    <div
      className="z-100 fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      id="loading-modal"
    >
      <div className="flex flex-col items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-t-4 border-blue-500"></div>
        <p className="mt-4 text-lg text-white">Loading...</p>
      </div>
    </div>
  );
};

export default Fetching;
