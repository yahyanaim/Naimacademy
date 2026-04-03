import Link from "next/link"
import { Trophy, XCircle, CheckCircle2, AlertCircle, Info } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ExamResultProps {
  score: number
  passed: boolean
  total: number
  correct: number
  results?: {
    question: string
    options: string[]
    userAnswer: number
    correctAnswer: number
    isCorrect: boolean
    notes: string
  }[]
}

export function ExamResult({ score, passed, total, correct, results }: ExamResultProps) {
  return (
    <div className="space-y-8 w-full max-w-2xl mx-auto">
      <Card className="w-full">
        <CardHeader className="items-center text-center gap-3">
          {passed ? (
            <Trophy className="size-16 text-green-500" />
          ) : (
            <XCircle className="size-16 text-destructive" />
          )}
          <div className="flex flex-col items-center gap-2">
            <CardTitle className="text-2xl">
              {passed ? "Congratulations!" : "Not Passed"}
            </CardTitle>
            <Badge variant={passed ? "default" : "destructive"}>
              {passed ? "Passed" : "Failed"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 text-center">
          <div className="flex flex-col gap-1">
            <p className="text-4xl font-bold">{score}%</p>
            <p className="text-sm text-muted-foreground">
              You scored {score}% ({correct}/{total} correct)
            </p>
          </div>
          {passed ? (
            <Button render={<Link href="/certificates" />} className="w-full">
              View My Certificates
            </Button>
          ) : (
            <Button render={<Link href="/exam/take" />} variant="outline" className="w-full">
              Try Again
            </Button>
          ) }
        </CardContent>
      </Card>

      {/* Detailed Results */}
      {results && results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold px-1">Detailed Review</h3>
          <div className="space-y-4">
            {results.map((res, i) => (
              <Card key={i} className={`overflow-hidden border-l-4 ${res.isCorrect ? 'border-l-green-500' : 'border-l-destructive'}`}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-sm leading-snug">
                      <span className="text-muted-foreground mr-1.5">{i + 1}.</span>
                      {res.question}
                    </p>
                    {res.isCorrect ? (
                      <CheckCircle2 className="size-5 text-green-500 shrink-0" />
                    ) : (
                      <AlertCircle className="size-5 text-destructive shrink-0" />
                    )}
                  </div>

                  <div className="space-y-2">
                    {res.options.map((opt, idx) => {
                      const isUser = res.userAnswer === idx;
                      const isCorrect = res.correctAnswer === idx;
                      
                      let variant: "outline" | "default" | "secondary" = "outline";
                      if (isCorrect) variant = "default"; // Highlight correct answer
                      
                      return (
                        <div 
                          key={idx} 
                          className={`text-xs p-2 rounded-md border ${
                            isCorrect 
                              ? 'bg-green-500/10 border-green-200 text-green-900 font-medium' 
                              : isUser 
                                ? 'bg-destructive/10 border-destructive/20 text-destructive' 
                                : 'bg-muted/30 border-transparent text-muted-foreground'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{opt}</span>
                            {isCorrect && <span className="text-[10px] uppercase font-bold tracking-wider">Correct Answer</span>}
                            {isUser && !isCorrect && <span className="text-[10px] uppercase font-bold tracking-wider text-destructive">Your Answer</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {res.notes && (
                    <div className="mt-3 p-3 bg-blue-50/50 border border-blue-100 rounded-lg flex gap-2.5 items-start">
                      <Info className="size-4 text-blue-500 mt-0.5 shrink-0" />
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Notes</p>
                        <p className="text-xs text-blue-900/80 leading-relaxed italic">"{res.notes}"</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
