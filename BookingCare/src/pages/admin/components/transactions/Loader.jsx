import React from 'react';

const Loader = () => (
  <div className="flex justify-center items-center h-full py-4">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--primary-color)]"></div>
  </div>
);

export default Loader; 