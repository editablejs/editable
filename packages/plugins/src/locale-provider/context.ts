import { createContext } from 'react';
import type { Locale } from '.';

const LocaleContext = createContext<Partial<Locale> | undefined>(undefined);

export default LocaleContext;
