import { createContext, useState, useContext } from "react";

const RegionContext = createContext();

export function RegionProvider({ children }) {
  // Default to US
  const [region, setRegion] = useState("US");

  return (
    <RegionContext.Provider value={{ region, setRegion }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  return useContext(RegionContext);
}
