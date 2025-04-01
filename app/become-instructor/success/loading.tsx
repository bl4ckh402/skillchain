import { Card, CardContent } from "@/components/ui/card"
import { RefreshCw } from "lucide-react"

export default function SuccessLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="container px-4 md:px-6">
          <Card className="mx-auto max-w-md">
            <CardContent className="p-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
                <p className="text-muted-foreground">Loading confirmation...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

