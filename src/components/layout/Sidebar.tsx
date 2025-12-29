import { Bucket, Tag } from '@/types';
import { cn } from '@/lib/utils';
import { Lightbulb, FileText, Target, MessageSquare, Settings } from 'lucide-react';

interface SidebarProps {
  buckets: Bucket[];
  tags: Tag[];
  selectedBucket: string | null;
  selectedTags: string[];
  onSelectBucket: (id: string | null) => void;
  onToggleTag: (id: string) => void;
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({
  buckets,
  tags,
  selectedBucket,
  selectedTags,
  onSelectBucket,
  onToggleTag,
  activeView,
  onViewChange,
}: SidebarProps) {
  const navItems = [
    { id: 'ideas', label: 'Ideas & Notes', icon: Lightbulb },
    { id: 'deliverables', label: 'Deliverables', icon: Target },
    { id: 'chat', label: 'AI Assistant', icon: MessageSquare },
  ];

  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="font-display text-xl font-bold text-gradient">IdeaForge</h1>
        <p className="text-xs text-muted-foreground mt-1">Think. Create. Deliver.</p>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              activeView === item.id
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Buckets */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Buckets
          </h3>
        </div>
        <div className="space-y-1">
          <button
            onClick={() => onSelectBucket(null)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200",
              selectedBucket === null
                ? "bg-sidebar-accent text-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <span>All Items</span>
            <span className="text-xs text-muted-foreground">
              {buckets.reduce((sum, b) => sum + b.count, 0)}
            </span>
          </button>
          {buckets.map(bucket => (
            <button
              key={bucket.id}
              onClick={() => onSelectBucket(bucket.id)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200",
                selectedBucket === bucket.id
                  ? "bg-sidebar-accent text-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <span className="flex items-center gap-2">
                <span>{bucket.icon}</span>
                <span className="truncate">{bucket.name}</span>
              </span>
              <span className="text-xs text-muted-foreground">{bucket.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="px-4 py-4 flex-1">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Tags
        </h3>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <button
              key={tag.id}
              onClick={() => onToggleTag(tag.id)}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200",
                selectedTags.includes(tag.id)
                  ? "ring-2 ring-offset-2 ring-offset-sidebar"
                  : "opacity-70 hover:opacity-100"
              )}
              style={{
                backgroundColor: `${tag.color}20`,
                color: tag.color,
                borderColor: selectedTags.includes(tag.id) ? tag.color : 'transparent',
              }}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="p-4 border-t border-sidebar-border">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-200">
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
    </aside>
  );
}
