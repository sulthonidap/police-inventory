import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function DashboardLoading() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="text-center space-y-2">
                <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mx-auto" />
                <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mx-auto" />
            </div>

            {/* Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="modern-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                            <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
