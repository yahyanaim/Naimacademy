import { ExternalLink, Link2, FileText, Globe } from "lucide-react";

interface Resource {
  name: string;
  url: string;
}

interface LinkItem {
  name: string;
  url: string;
}

interface LessonContentProps {
  description?: string;
  summary?: string;
  explanation?: string;
  images?: string[];
  resources?: Resource[];
  links?: LinkItem[];
  transcript?: string;
}

export function LessonContent({
  explanation,
  resources,
  links,
}: LessonContentProps) {
  if (!explanation && (!resources || resources.length === 0) && (!links || links.length === 0)) {
    return null;
  }

  return (
    <div className="space-y-6 mt-8">
      {/* Detailed Explanation with Table */}
      {explanation && (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="bg-black px-6 py-3 border-b border-border flex items-center gap-2">
            <FileText className="size-4 text-white" />
            <h3 className="font-semibold text-white">Detailed Explanation</h3>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {explanation.split('\n').filter(Boolean).map((line, i) => {
                  const isHeader = line.startsWith('###') || line.startsWith('##');
                  const isList = line.startsWith('- ') || line.startsWith('* ');
                  const isNumbered = /^\d+\.\s/.test(line);
                  
                  if (isHeader) {
                    return (
                      <tr key={i}>
                        <td colSpan={2} className="py-3 font-bold text-base">
                          {line.replace(/^#+\s*/, '')}
                        </td>
                      </tr>
                    );
                  }
                  if (isList || isNumbered) {
                    return (
                      <tr key={i}>
                        <td className="py-1 pr-4 align-top text-black">•</td>
                        <td className="py-1 text-black">{line.replace(/^[-*\d.]+\s*/, '')}</td>
                      </tr>
                    );
                  }
                  if (line.trim()) {
                    const [key, ...valueParts] = line.split(':');
                    const value = valueParts.join(':').trim();
                    if (key && value) {
                      return (
                        <tr key={i} className="border-b border-border/50">
                          <td className="py-2 pr-4 font-medium text-black align-top">{key}</td>
                          <td className="py-2 text-black">{value}</td>
                        </tr>
                      );
                    }
                    return (
                      <tr key={i}>
                        <td colSpan={2} className="py-2 text-black">{line}</td>
                      </tr>
                    );
                  }
                  return null;
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Resources */}
      {resources && resources.length > 0 && (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="bg-black px-6 py-3 border-b border-border flex items-center gap-2">
            <ExternalLink className="size-4 text-white" />
            <h3 className="font-semibold text-white">Resources</h3>
          </div>
          <div className="p-4">
            <ul className="space-y-2">
              {resources.map((resource, index) => (
                <li key={index}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-black hover:underline"
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

      {/* Additional Links */}
      {links && links.length > 0 && (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="bg-black px-6 py-3 border-b border-border flex items-center gap-2">
            <Globe className="size-4 text-white" />
            <h3 className="font-semibold text-white">Additional Links</h3>
          </div>
          <div className="p-4">
            <ul className="space-y-2">
              {links.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-black hover:underline"
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
