import { createContext, useContext } from 'react';

type FocusedContext = [boolean, (focused: boolean) => void];

export const FocusedContext = createContext<FocusedContext>(null as any);

export const useFocused = (): FocusedContext => {
  return useContext(FocusedContext);
};
