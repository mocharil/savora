"use client";

import React from "react";
import BlockLoader from "./block-loader";

interface PageLoaderProps {
  message?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({
  message = "Memuat...",
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
      <BlockLoader
        blockColor="bg-orange-500"
        borderColor="border-orange-500"
        size={50}
        gap={4}
        speed={1}
      />
      {message && (
        <p className="mt-4 text-sm text-gray-500 animate-pulse">{message}</p>
      )}
    </div>
  );
};

export default PageLoader;
