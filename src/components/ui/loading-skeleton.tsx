import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Specialized loading skeletons
export function TableSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-4 p-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
        <Skeleton className="h-8 w-[80px]" />
      </div>
      <div className="flex items-center space-x-4 p-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-[280px]" />
          <Skeleton className="h-4 w-[160px]" />
        </div>
        <Skeleton className="h-8 w-[80px]" />
      </div>
      <div className="flex items-center space-x-4 p-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-[220px]" />
          <Skeleton className="h-4 w-[190px]" />
        </div>
        <Skeleton className="h-8 w-[80px]" />
      </div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="p-6 border rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <Skeleton className="h-8 w-[60px]" />
      <Skeleton className="h-3 w-[120px]" />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-[300px]" />
        <Skeleton className="h-4 w-[400px]" />
      </div>
      
      {/* Stats cards skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      
      {/* Content cards skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 border rounded-lg space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-[150px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
          <TableSkeleton />
        </div>
        <div className="p-6 border rounded-lg space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-[150px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
          <TableSkeleton />
        </div>
      </div>
    </div>
  )
}

export { Skeleton }