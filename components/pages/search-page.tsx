"use client";

import { useState, useEffect } from "react";
import { ContentGrid } from "../content-grid";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Content } from "../streaming-app";

interface SearchPageProps {
  onPlayContent: (content: Content) => void;
  onBack: () => void;
  initialSearchQuery?: string;
}

export function SearchPage({ onPlayContent, onBack, initialSearchQuery = "" }: SearchPageProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [searchResults, setSearchResults] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.trim()) {
      const ws = new WebSocket(`wss://nestfilm.hopto.org/content?type=search&q=${encodeURIComponent(searchQuery)}`);
      
      setSearchResults([]);
      setLoading(true);
      
      ws.onopen = () => {
        console.log("Search WebSocket opened");
      };

      ws.onmessage = (event) => {
        try {
          const content: Content = JSON.parse(event.data);
          setSearchResults(prev => [...prev, content]);
        } catch (error) {
          console.error("Error parsing search result data:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("Search WebSocket error:", error);
        setLoading(false);
      };

      ws.onclose = () => {
        console.log("Search WebSocket closed");
        setLoading(false);
      };

      // Clean up WebSocket connection
      return () => {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
      };
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="glass"
          size="icon"
          onClick={onBack}
        >
          <X className="w-5 h-5" />
        </Button>
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
          <Input
            type="text"
            placeholder="Search for movies, series..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 glass border-primary/50 text-white"
          />
          {searchQuery && (
            <Button
              variant="glass"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              onClick={clearSearch}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {searchResults.length > 0 ? (
        <ContentGrid 
          content={searchResults} 
          loading={loading} 
          onPlayContent={onPlayContent} 
        />
      ) : searchQuery ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Enter a search term to find movies and series</p>
        </div>
      )}
    </div>
  );
}