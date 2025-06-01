import { Book, Calendar, Download, FileText, User2, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import React, { useMemo, useCallback } from "react";

// CSS for the masking effect - moved to a constant for better performance
const MASK_STYLES = {
  maskBottom: {
    WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
    maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
  }
} as const;

interface AcademicResult {
  title: string;
  url: string;
  author?: string | null;
  publishedDate?: string;
  summary: string;
}

interface AcademicPapersProps {
  results: AcademicResult[];
  maxVisible?: number;
}

// Memoized paper card component for better performance
const PaperCard = React.memo(({ 
  paper, 
  index, 
  onViewPaper, 
  onDownloadPdf 
}: {
  paper: AcademicResult;
  index: number;
  onViewPaper: (url: string) => void;
  onDownloadPdf: (url: string) => void;
}) => {
  // Memoize author processing
  const formattedAuthor = useMemo(() => {
    if (!paper.author) return null;
    
    const authors = paper.author.split(';').map(author => author.trim());
    if (authors.length <= 2) {
      return authors.join(', ');
    }
    return `${authors.slice(0, 2).join(', ')} et al.`;
  }, [paper.author]);

  // Memoize date formatting
  const formattedDate = useMemo(() => {
    if (!paper.publishedDate) return null;
    
    try {
      return new Date(paper.publishedDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return paper.publishedDate;
    }
  }, [paper.publishedDate]);

  // Check if it's an arXiv paper
  const isArxivPaper = useMemo(() => 
    paper.url.toLowerCase().includes('arxiv.org'), 
    [paper.url]
  );

  const handleViewPaper = useCallback(() => {
    onViewPaper(paper.url);
  }, [paper.url, onViewPaper]);

  const handleDownloadPdf = useCallback(() => {
    onDownloadPdf(paper.url.replace('/abs/', '/pdf/'));
  }, [paper.url, onDownloadPdf]);

  return (
    <motion.div
      className="w-[360px] flex-none"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
    >
      <div className="h-[300px] relative group">
        <div className="h-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 flex flex-col transition-all duration-200 hover:border-violet-200 dark:hover:border-violet-800 hover:shadow-md hover:shadow-violet-100 dark:hover:shadow-violet-900/20">
          {/* Title */}
          <h3 
            className="font-semibold text-lg tracking-tight mb-2 line-clamp-2 text-neutral-900 dark:text-neutral-100"
            title={paper.title}
          >
            {paper.title}
          </h3>

          {/* Metadata badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            {formattedAuthor && (
              <div className="inline-flex items-center gap-1.5 px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-800 rounded-md text-neutral-700 dark:text-neutral-300">
                <User2 className="h-3 w-3 text-violet-500 flex-shrink-0" />
                <span className="line-clamp-1" title={paper.author || undefined}>
                  {formattedAuthor}
                </span>
              </div>
            )}

            {formattedDate && (
              <div className="inline-flex items-center gap-1.5 px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-800 rounded-md text-neutral-700 dark:text-neutral-300">
                <Calendar className="h-3 w-3 text-violet-500 flex-shrink-0" />
                <span>{formattedDate}</span>
              </div>
            )}
          </div>

          {/* Summary with fade effect */}
          <div className="flex-1 mb-3 overflow-hidden relative">
            <div 
              className="h-full pr-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600" 
              style={MASK_STYLES.maskBottom}
            >
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {paper.summary}
              </p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-neutral-900 to-transparent pointer-events-none" />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-auto">
            <Button
              variant="outline"
              onClick={handleViewPaper}
              className="flex-1 text-sm hover:bg-violet-50 dark:hover:bg-violet-900/10 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-300 dark:hover:border-violet-700 transition-all duration-200"
              size="sm"
              aria-label={`View paper: ${paper.title}`}
            >
              <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">View Paper</span>
              <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0 opacity-50" />
            </Button>

            {isArxivPaper && (
              <Button
                variant="outline"
                onClick={handleDownloadPdf}
                className="text-sm hover:bg-violet-50 dark:hover:bg-violet-900/10 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-300 dark:hover:border-violet-700 transition-all duration-200"
                size="sm"
                aria-label={`Download PDF: ${paper.title}`}
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

PaperCard.displayName = 'PaperCard';

const AcademicPapersCard = ({ results, maxVisible = 10 }: AcademicPapersProps) => {
  // Memoize displayed results
  const displayedResults = useMemo(() => 
    results.slice(0, maxVisible), 
    [results, maxVisible]
  );

  // Memoized handlers to prevent unnecessary re-renders
  const handleViewPaper = useCallback((url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const handleDownloadPdf = useCallback((url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  // Show loading state or empty state
  if (!results.length) {
    return (
      <Card className="w-full my-4 border border-neutral-200 dark:border-neutral-800">
        <CardHeader className="text-center py-8">
          <div className="h-12 w-12 rounded-lg bg-violet-100 dark:bg-violet-900/20 flex items-center justify-center mx-auto mb-4">
            <Book className="h-6 w-6 text-violet-600 dark:text-violet-400" />
          </div>
          <CardTitle className="text-neutral-500 dark:text-neutral-400">
            No academic papers found
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full my-4 overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/20 flex items-center justify-center flex-shrink-0">
            <Book className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg">Academic Papers</CardTitle>
            <p className="text-sm text-muted-foreground">
              Found {results.length} paper{results.length !== 1 ? 's' : ''}
              {maxVisible < results.length && ` (showing first ${maxVisible})`}
            </p>
          </div>
        </div>
      </CardHeader>

      <div className="px-4 pb-4">
        <div 
          className="flex overflow-x-auto gap-3 pb-2 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600 hover:scrollbar-thumb-neutral-400 dark:hover:scrollbar-thumb-neutral-500"
          role="region"
          aria-label="Academic papers list"
        >
          {displayedResults.map((paper, index) => (
            <PaperCard
              key={`${paper.url}-${index}`}
              paper={paper}
              index={index}
              onViewPaper={handleViewPaper}
              onDownloadPdf={handleDownloadPdf}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};

// Export with memo for performance optimization
export default React.memo(AcademicPapersCard);
