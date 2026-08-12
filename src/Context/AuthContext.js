/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
import React, { createContext, useState, useContext } from 'react';


const RolesContext = createContext();

// Create a provider component
export const RolesProvider = ({ children }) => {
  const [role, setRole] = useState(null);
  return (
    <RolesContext.Provider value={{ role, setRole }}>
      {children}
    </RolesContext.Provider>
  );
};

// Create a custom hook for easier usage
export const useRoles = () => {
  return useContext(RolesContext);
};
