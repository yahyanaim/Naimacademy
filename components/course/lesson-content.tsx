import { ExternalLink, FileText, Link2, Image as ImageIcon, BookOpen } from "lucide-react";

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
  return (
    <div className="space-y-8 mt-6">
      {summary && (
        <div className="bg-muted/20 p-6 rounded-2xl border border-border/50 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="size-5 text-green-500" />
            <h3 className="text-xl font-semibold tracking-tight">Summary</h3>
          </div>
          <div className="text-base text-foreground/90 whitespace-pre-wrap leading-relaxed prose prose-sm dark:prose-invert max-w-none">
            {summary}
          </div>
        </div>
      )}

      {explanation && (
        <div className="bg-muted/20 p-6 rounded-2xl border border-border/50 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="size-5 text-blue-500" />
            <h3 className="text-xl font-semibold tracking-tight">Detailed Explanation</h3>
          </div>
          <div className="text-base text-foreground/90 whitespace-pre-wrap leading-relaxed prose prose-sm dark:prose-invert max-w-none">
            {explanation}
          </div>
        </div>
      )}

      {images && images.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <ImageIcon className="size-5" />
            Images
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Lesson image ${index + 1}`}
                className="rounded-lg border border-border/50 shadow-sm w-full h-auto"
              />
            ))}
          </div>
        </div>
      )}

      {(transcript || description) && (
        <div className="bg-muted/20 p-6 rounded-2xl border border-border/50 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="size-5 text-blue-500" />
            <h3 className="text-xl font-semibold tracking-tight">Lesson Resume</h3>
          </div>
          <div className="text-base text-foreground/90 whitespace-pre-wrap leading-relaxed prose prose-sm dark:prose-invert max-w-none">
            {transcript || description}
          </div>
        </div>
      )}

      {resources && resources.length > 0 && (
        <div className="space-y-4 px-2">
          <h3 className="text-lg font-semibold tracking-tight">Resources</h3>
          <ul className="space-y-3">
            {resources.map((resource, index) => (
              <li key={index}>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-base text-blue-600 hover:text-blue-700 transition-colors bg-blue-50/50 dark:bg-blue-950/30 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900 shadow-sm hover:shadow"
                >
                  <ExternalLink className="size-4 shrink-0" />
                  {resource.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {links && links.length > 0 && (
        <div className="space-y-4 px-2">
          <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <Link2 className="size-5" />
            Additional Links
          </h3>
          <ul className="space-y-3">
            {links.map((link, index) => (
              <li key={index}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-base text-blue-600 hover:text-blue-700 transition-colors bg-blue-50/50 dark:bg-blue-950/30 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900 shadow-sm hover:shadow"
                >
                  <ExternalLink className="size-4 shrink-0" />
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
