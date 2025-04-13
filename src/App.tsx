import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import ShoppingCart from '@/pages/ShoppingCart';
import SignIn from '@/pages/SignIn';
import SignUp from '@/pages/SignUp';
import Home from '@/pages/Home';
import ProfilePage from '@/pages/ProfilePage';
import { Toaster } from 'sonner';

function App() {
  const [theme, setTheme] = useState(() => {
    if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar theme={theme} toggleTheme={toggleTheme} />
        <Routes>
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/cart" element={<ShoppingCart />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
      <Toaster richColors position="bottom-right" />
    </div>
  );
}

export default App;
