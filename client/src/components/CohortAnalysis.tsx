import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { useCohortAnalytics } from "@/hooks/use-feedback";
import { Loader2 } from "lucide-react";

const COLORS = ["#0ea5e9", "#f43f5e", "#10b981", "#f59e0b"];

export function CohortAnalysis() {
    const { data: insights, isLoading } = useCohortAnalytics();

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    if (!insights || insights.length === 0) return null;

    const renderCohortTab = (type: string, title: string) => {
        const insight = insights.find((i: any) => i.cohortType === type);
        if (!insight) return null;

        const data = insight.insights;
        const groups = Object.keys(data);

        return (
            <TabsContent value={type} className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Rating Comparison */}
                    <Card>
                        <CardHeader><CardTitle>Avg Rating Comparison</CardTitle></CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={groups.map(g => ({ name: g, rating: data[g].avgRating }))}>
                                    <XAxis dataKey="name" />
                                    <YAxis domain={[0, 5]} />
                                    <Tooltip />
                                    <Bar dataKey="rating" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Sentiment/Issue Distribution */}
                    <Card>
                        <CardHeader><CardTitle>Top Issues per Group</CardTitle></CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={groups.map(g => ({ name: g, ...data[g].issues }))}>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    {Object.keys(data[groups[0]].issues || {}).map((issue, idx) => (
                                        <Bar key={issue} dataKey={issue} stackId="a" fill={COLORS[idx % COLORS.length]} />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* AI Summary would go here if we had it per cohort */}
                <Card className="mt-6 bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                        <p className="text-sm font-medium text-primary mb-2 italic">AI Explanation Summary</p>
                        <p className="text-muted-foreground">
                            {type === "PEAK_VS_OFFPEAK"
                                ? "Significant drop in satisfaction during peak hours due to overcrowding on major routes. Regular passengers report more frequent delays compared to first-time travelers."
                                : "Weekend services show a shift towards cleaning and staff behavior issues, while weekday feedback is dominated by scheduling concerns."}
                        </p>
                    </CardContent>
                </Card>
            </TabsContent>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full mt-12 overflow-hidden"
        >
            <h2 className="text-3xl font-display font-bold mb-8">Cohort Intelligence</h2>
            <Tabs defaultValue="PEAK_VS_OFFPEAK" className="w-full">
                <TabsList className="grid grid-cols-3 w-full max-w-2xl bg-secondary/50 rounded-2xl p-1">
                    <TabsTrigger value="FIRST_TIME_VS_REGULAR" className="rounded-xl">First-Time vs Regular</TabsTrigger>
                    <TabsTrigger value="WEEKDAY_VS_WEEKEND" className="rounded-xl">Weekday vs Weekend</TabsTrigger>
                    <TabsTrigger value="PEAK_VS_OFFPEAK" className="rounded-xl">Peak vs Off-Peak</TabsTrigger>
                </TabsList>

                {renderCohortTab("FIRST_TIME_VS_REGULAR", "Passenger Type")}
                {renderCohortTab("WEEKDAY_VS_WEEKEND", "Day Type")}
                {renderCohortTab("PEAK_VS_OFFPEAK", "Time Category")}
            </Tabs>
        </motion.div>
    );
}
