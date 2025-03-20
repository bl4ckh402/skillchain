import { Button } from "./ui/button"
import { Briefcase } from "lucide-react"

interface EmptyStateProps {
  title: string
  description: string
  icon?: React.ReactNode
}

export function EmptyState({ 
  title, 
  description, 
  icon = <Briefcase className="h-10 w-10 text-blue-500" />
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-6">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-medium text-slate-800 dark:text-slate-200">
        {title}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        {description}
      </p>
      <Button className="mt-4 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white">
        Browse All Jobs
      </Button>
    </div>
  )
}