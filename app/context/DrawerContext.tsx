import React, { createContext, useContext } from 'react';

interface DrawerContextType {
  openDrawer: () => void;
  closeDrawer: () => void;
  isDrawerOpen: boolean;
}

export const DrawerContext =
  createContext<DrawerContextType>({
    openDrawer: () => {},
    closeDrawer: () => {},
    isDrawerOpen: false,
  });

export const useDrawer = () => useContext(DrawerContext);