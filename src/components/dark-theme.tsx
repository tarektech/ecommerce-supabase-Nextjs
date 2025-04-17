
import { useState } from 'react';
import { Button } from './ui/button';
import { Menu } from 'lucide-react';



export default function DarkTheme() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="sm:hidden"
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
    >
      <Menu className="h-6 w-6" />
    </Button>
  );
}
