import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type FocusLockContextType = {
  isFocusLocked: boolean;
  setFocusLocked: (locked: boolean) => void;
};

const FocusLockContext =
  createContext<FocusLockContextType | undefined>(undefined);

export function FocusLockProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isFocusLocked, setIsFocusLocked] =
    useState(false);

  const value = useMemo(
    () => ({
      isFocusLocked,
      setFocusLocked: setIsFocusLocked,
    }),
    [isFocusLocked]
  );

  return (
    <FocusLockContext.Provider value={value}>
      {children}
    </FocusLockContext.Provider>
  );
}

export function useFocusLock() {
  const context = useContext(FocusLockContext);

  if (!context) {
    throw new Error(
      'useFocusLock must be used inside FocusLockProvider'
    );
  }

  return context;
}