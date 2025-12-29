import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, LogOut, Settings } from 'lucide-react';

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
    <header className="h-12 border-b border-border/30 bg-background flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        {state.level !== 'space' && state.spaceId && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={navigateBack}
            className="h-7 w-7"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}
        
        <div className="flex items-center gap-1.5 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="text-muted-foreground/50">/</span>}
              <span className={index === breadcrumbs.length - 1 ? 'font-medium text-foreground' : 'text-muted-foreground'}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
          {breadcrumbs.length === 0 && (
            <span className="text-muted-foreground">Select a space</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground hidden md:block mr-2">
          {user?.email}
        </span>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Settings className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={signOut} className="h-7 w-7">
          <LogOut className="w-3.5 h-3.5" />
        </Button>
      </div>
    </header>
  );
};
