import ReduxProvider from './ReduxProvider';
import { ThemeProvider } from './ThemeProvider';

/**
 * Combined Providers component
 * Wraps all application-level providers in the correct order
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </ReduxProvider>
  );
}
