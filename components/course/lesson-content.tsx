import { ExternalLink, FileText } from "lucide-react";

interface Resource {
  name: string;
  url: string;
}

interface LessonContentProps {
  description: string;
  resources: Resource[];
  transcript?: string;
}

export function LessonContent({ description, resources, transcript }: LessonContentProps) {
  return (
    <div className="space-y-8 mt-6">
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
          <h3 className="text-lg font-semibold tracking-tight">Resources & Links</h3>
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
    </div>
  );
}
