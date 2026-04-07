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
    <div className="space-y-4 mt-4">
      {/* Detailed Explanation with Table */}
      {explanation && (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center gap-2">
            <FileText className="size-4 text-gray-700" />
            <h3 className="font-semibold text-gray-700 text-sm">Detailed Explanation</h3>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="w-full text-sm border-collapse min-w-[500px]">
              <tbody>
                {explanation.split('\n').filter(Boolean).map((line, i) => {
                  const isHeader = line.startsWith('###') || line.startsWith('##');
                  const isList = line.startsWith('- ') || line.startsWith('* ');
                  const isNumbered = /^\d+\.\s/.test(line);
                  
                  if (isHeader) {
                    return (
                      <tr key={i}>
                        <td colSpan={2} className="py-1 font-bold text-base text-gray-900">
                          {line.replace(/^#+\s*/, '')}
                        </td>
                      </tr>
                    );
                  }
                  if (isList || isNumbered) {
                    return (
                      <tr key={i}>
                        <td className="py-1 pr-4 align-top text-gray-600 w-4">•</td>
                        <td className="py-1 text-gray-700">{line.replace(/^[-*\d.]+\s*/, '')}</td>
                      </tr>
                    );
                  }
                  if (line.trim()) {
                    const [key, ...valueParts] = line.split(':');
                    const value = valueParts.join(':').trim();
                    if (key && value) {
                      return (
                        <tr key={i} className="border-b border-gray-100">
                          <td className="py-1 pr-4 font-medium text-gray-900 align-top w-1/4">{key}</td>
                          <td className="py-1 text-gray-700">{value}</td>
                        </tr>
                      );
                    }
                    return (
                      <tr key={i}>
                        <td colSpan={2} className="py-1 text-gray-700">{line}</td>
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
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center gap-2">
            <ExternalLink className="size-4 text-gray-700" />
            <h3 className="font-semibold text-gray-700 text-sm">Resources</h3>
          </div>
          <div className="p-3">
            <ul className="space-y-1.5">
              {resources.map((resource, index) => (
                <li key={index}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 hover:underline"
                  >
                    <ExternalLink className="size-3.5 shrink-0 text-gray-500" />
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
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center gap-2">
            <Globe className="size-4 text-gray-700" />
            <h3 className="font-semibold text-gray-700 text-sm">Additional Links</h3>
          </div>
          <div className="p-3">
            <ul className="space-y-1.5">
              {links.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 hover:underline"
                  >
                    <Link2 className="size-3.5 shrink-0 text-gray-500" />
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
