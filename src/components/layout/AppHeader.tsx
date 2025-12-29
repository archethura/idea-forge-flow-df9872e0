import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, LogOut, Layers, Settings, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AppHeaderProps {
  spaceName?: string;
  folderName?: string;
  outlineName?: string;
  documentName?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  spaceName,
  folderName,
  outlineName,
  documentName,
}) => {
  const { signOut, user } = useAuth();
  const { state, navigateBack } = useNavigation();

  const breadcrumbs = [
    spaceName,
    folderName,
    outlineName,
    documentName,
  ].filter(Boolean);

  return (
    <header className="h-14 border-b border-border/50 bg-background/80 backdrop-blur-xl flex items-center justify-between px-4 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        {state.level !== 'space' && (
          <Button variant="ghost" size="icon" onClick={navigateBack}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
        
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/20">
            <Layers className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-center gap-1 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="text-muted-foreground">/</span>}
                <span className={index === breadcrumbs.length - 1 ? 'font-medium' : 'text-muted-foreground'}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
            {breadcrumbs.length === 0 && (
              <span className="font-semibold text-gradient">SPACE</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search everything..."
            className="pl-10 bg-muted/50 border-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground hidden md:block">
          {user?.email}
        </span>
        <Button variant="ghost" size="icon">
          <Settings className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={signOut}>
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
};
