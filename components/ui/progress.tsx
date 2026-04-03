"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const ProgressContext = React.createContext<number>(0)

function Progress({
  className,
  children,
  value = 0,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value?: number }) {
  return (
    <ProgressContext.Provider value={value}>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn("flex flex-col gap-2 w-full", className)}
        {...props}
      >
        {children ? (
          children
        ) : (
          <ProgressTrack>
            <ProgressIndicator />
          </ProgressTrack>
        )}
      </div>
    </ProgressContext.Provider>
  )
}

function ProgressTrack({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-secondary/30",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function ProgressIndicator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const value = React.useContext(ProgressContext)
  return (
    <div
      className={cn(
        "h-full bg-primary transition-all duration-500 ease-in-out rounded-full",
        className
      )}
      style={{ width: `${value}%` }}
      {...props}
    />
  )
}

function ProgressLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-sm font-medium", className)} {...props} />
}

function ProgressValue({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const value = React.useContext(ProgressContext)
  return (
    <div
      className={cn(
        "ml-auto text-sm text-muted-foreground tabular-nums",
        className
      )}
      {...props}
    >
      {value}%
    </div>
  )
}

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
}
