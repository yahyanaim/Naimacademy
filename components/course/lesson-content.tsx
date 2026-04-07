import { ExternalLink, FileText, Link2, Image as ImageIcon, BookOpen, ListChecks, Globe } from "lucide-react";

interface Resource {
  name: string;
  url: string;
}

interface LinkItem {
  name: string;
  url: string;
}

interface LessonContentProps {
  description: string;
  summary?: string;
  explanation?: string;
  images?: string[];
  resources?: Resource[];
  links?: LinkItem[];
  transcript?: string;
}

export function LessonContent({
  description,
  summary,
  explanation,
  images,
  resources,
  links,
  transcript,
}: LessonContentProps) {
  const hasContent = summary || explanation || (images && images.length > 0) || (resources && resources.length > 0) || (links && links.length > 0) || transcript || description;

  if (!hasContent) {
    return null;
  }

  return (
    <div className="space-y-6 mt-8">
      {/* Section 1: Summary */}
      {summary && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl border border-green-100 dark:border-green-900 overflow-hidden">
          <div className="bg-green-100/50 dark:bg-green-900/30 px-6 py-3 border-b border-green-200 dark:border-green-800 flex items-center gap-2">
            <BookOpen className="size-4 text-green-600" />
            <h3 className="font-semibold text-green-800 dark:text-green-200">Summary</h3>
          </div>
          <div className="p-6 text-sm leading-relaxed">
            {summary}
          </div>
        </div>
      )}

      {/* Section 2: Detailed Explanation */}
      {explanation && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl border border-blue-100 dark:border-blue-900 overflow-hidden">
          <div className="bg-blue-100/50 dark:bg-blue-900/30 px-6 py-3 border-b border-blue-200 dark:border-blue-800 flex items-center gap-2">
            <FileText className="size-4 text-blue-600" />
            <h3 className="font-semibold text-blue-800 dark:text-blue-200">Detailed Explanation</h3>
          </div>
          <div className="p-6 text-sm leading-relaxed whitespace-pre-wrap">
            {explanation}
          </div>
        </div>
      )}

      {/* Section 3: Images */}
      {images && images.length > 0 && (
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="bg-muted/50 px-6 py-3 border-b border-border flex items-center gap-2">
            <ImageIcon className="size-4 text-muted-foreground" />
            <h3 className="font-semibold">Images</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img}
                    alt={`Lesson image ${index + 1}`}
                    className="rounded-lg border border-border w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section 4: Lesson Resume / Transcript */}
      {(transcript || description) && (
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="bg-muted/50 px-6 py-3 border-b border-border flex items-center gap-2">
            <ListChecks className="size-4 text-muted-foreground" />
            <h3 className="font-semibold">Lesson Resume</h3>
          </div>
          <div className="p-6 text-sm leading-relaxed whitespace-pre-wrap">
            {transcript || description}
          </div>
        </div>
      )}

      {/* Section 5: Resources */}
      {resources && resources.length > 0 && (
        <div className="rounded-2xl border border-amber-100 dark:border-amber-900 overflow-hidden">
          <div className="bg-amber-50 dark:bg-amber-950/30 px-6 py-3 border-b border-amber-200 dark:border-amber-800 flex items-center gap-2">
            <ExternalLink className="size-4 text-amber-600" />
            <h3 className="font-semibold text-amber-800 dark:text-amber-200">Resources</h3>
          </div>
          <div className="p-6">
            <ul className="space-y-2">
              {resources.map((resource, index) => (
                <li key={index}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 hover:underline transition-colors"
                  >
                    <ExternalLink className="size-3.5 shrink-0" />
                    {resource.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Section 6: Additional Links */}
      {links && links.length > 0 && (
        <div className="rounded-2xl border border-purple-100 dark:border-purple-900 overflow-hidden">
          <div className="bg-purple-50 dark:bg-purple-950/30 px-6 py-3 border-b border-purple-200 dark:border-purple-800 flex items-center gap-2">
            <Globe className="size-4 text-purple-600" />
            <h3 className="font-semibold text-purple-800 dark:text-purple-200">Additional Links</h3>
          </div>
          <div className="p-6">
            <ul className="space-y-2">
              {links.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 hover:underline transition-colors"
                  >
                    <Link2 className="size-3.5 shrink-0" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
