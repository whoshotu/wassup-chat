import { useState } from 'react';
import { MobileNav } from '@/components/layout/MobileNav';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToneTag } from '@/components/decoder/ToneTag';
import { useMessageHistory, DecodedMessage } from '@/contexts/MessageHistoryContext';
import { Search, Star, Globe, Calendar, X, History } from 'lucide-react';
import { format } from 'date-fns';

export function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<DecodedMessage | null>(null);
  const { messages, toggleFavorite, searchMessages, getFavorites } = useMessageHistory();

  const displayedMessages = showFavoritesOnly
    ? getFavorites()
    : searchQuery
    ? searchMessages(searchQuery)
    : messages;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-lg border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <History className="h-4 w-4 text-primary-foreground" />
              </div>
              <h1 className="text-lg font-bold">Message History</h1>
            </div>
            <ThemeToggle />
          </div>
          
          {/* Search and Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <Button
              variant={showFavoritesOnly ? 'default' : 'outline'}
              size="icon"
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className="h-10 w-10 flex-shrink-0"
            >
              <Star className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 max-w-4xl">
        {displayedMessages.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center">
            <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <History className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">
              {showFavoritesOnly
                ? 'No favorites yet'
                : searchQuery
                ? 'No messages found'
                : 'No decoded messages yet'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              {showFavoritesOnly
                ? 'Star messages to add them to your favorites'
                : searchQuery
                ? 'Try a different search term'
                : 'Start by decoding your first message!'}
            </p>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {displayedMessages.map((message) => (
              <Card
                key={message.id}
                className="p-4 cursor-pointer hover:border-primary/50 transition-all active:scale-[0.98] touch-manipulation"
                onClick={() => setSelectedMessage(message)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                      <Globe className="h-3 w-3 flex-shrink-0" />
                      <span>{message.detectedLanguage}</span>
                      <span>•</span>
                      <span>{format(new Date(message.timestamp), 'MMM d')}</span>
                    </div>
                    <p className="text-sm font-medium mb-3 line-clamp-2">
                      {message.originalText}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {message.toneTags.slice(0, 2).map((tone, index) => (
                        <ToneTag key={index} tone={tone} />
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(message.id);
                    }}
                    className="flex-shrink-0 p-1 -m-1 touch-manipulation"
                  >
                    <Star
                      className={`h-5 w-5 transition-colors ${
                        message.isFavorite
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground/50 hover:text-muted-foreground'
                      }`}
                    />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelectedMessage(null)}
        >
          <Card
            className="w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl scrollbar-thin"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-primary" />
                  <span className="font-medium">{selectedMessage.detectedLanguage}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{selectedMessage.region}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFavorite(selectedMessage.id)}
                    className="p-1 touch-manipulation"
                  >
                    <Star
                      className={`h-5 w-5 ${
                        selectedMessage.isFavorite
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="p-1 touch-manipulation"
                  >
                    <X className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div className="bg-secondary/50 rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Original Message</p>
                <p className="text-base font-medium">{selectedMessage.originalText}</p>
              </div>

              <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Decoded Meaning</p>
                <p className="text-base">{selectedMessage.plainExplanation}</p>
              </div>

              {selectedMessage.toneTags.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Tone</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMessage.toneTags.map((tone, index) => (
                      <ToneTag key={index} tone={tone} />
                    ))}
                  </div>
                </div>
              )}

              {selectedMessage.slangItems.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Slang & Phrases</p>
                  <div className="space-y-2">
                    {selectedMessage.slangItems.map((item, index) => (
                      <div key={index} className="bg-secondary/50 rounded-xl p-3">
                        <p className="font-medium text-sm text-primary mb-1">{item.term}</p>
                        <p className="text-sm mb-1">{item.definition}</p>
                        <p className="text-xs text-muted-foreground">{item.context}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={() => setSelectedMessage(null)} className="w-full h-11">
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      <MobileNav />
    </div>
  );
}

export default HistoryPage;
