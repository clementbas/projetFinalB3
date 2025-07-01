export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}

export function LoadingTable() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-muted animate-pulse rounded"></div>
      ))}
    </div>
  )
}

export function LoadingCard() {
  return (
    <div className="space-y-4">
      <div className="h-6 bg-muted animate-pulse rounded w-1/3"></div>
      <div className="h-4 bg-muted animate-pulse rounded w-2/3"></div>
      <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
    </div>
  )
}