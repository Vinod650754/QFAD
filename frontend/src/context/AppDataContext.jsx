import { createContext, useCallback, useContext, useMemo, useState } from "react";

const AppDataContext = createContext(null);

export const AppDataProvider = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [profileSnapshot, setProfileSnapshot] = useState(null);

  const refreshAppData = useCallback((snapshot) => {
    if (snapshot) setProfileSnapshot(snapshot);
    setRefreshKey((value) => value + 1);
  }, []);

  const value = useMemo(
    () => ({ refreshKey, profileSnapshot, setProfileSnapshot, refreshAppData }),
    [refreshKey, profileSnapshot, refreshAppData]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export const useAppData = () => useContext(AppDataContext);
