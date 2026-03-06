import { storage } from "./storage";
import { type Feedback } from "@shared/schema";

export async function computeCohortInsights(orgId: string) {
    const feedback = await storage.getFeedbackByOrg(orgId);
    if (feedback.length === 0) return;

    // 1. First-Time vs Regular
    const ftvReg = {
        first_time: { avgRating: 0, count: 0, issues: {} as Record<string, number> },
        regular: { avgRating: 0, count: 0, issues: {} as Record<string, number> }
    };

    // 2. Weekday vs Weekend
    const wkvWk = {
        weekday: { avgRating: 0, count: 0, sentiment: { pos: 0, neu: 0, neg: 0 } },
        weekend: { avgRating: 0, count: 0, sentiment: { pos: 0, neu: 0, neg: 0 } }
    };

    // 3. Peak vs Off-Peak
    const pvOp = {
        peak: { avgRating: 0, count: 0, issues: {} as Record<string, number> },
        off_peak: { avgRating: 0, count: 0, issues: {} as Record<string, number> }
    };

    feedback.forEach(f => {
        const sentiment = f.rating >= 4 ? "pos" : f.rating <= 2 ? "neg" : "neu";

        // First-Time vs Regular
        const pType = f.passengerType === "FIRST_TIME" ? "first_time" : "regular";
        ftvReg[pType].avgRating += f.rating;
        ftvReg[pType].count++;
        if (f.issueCategory) {
            ftvReg[pType].issues[f.issueCategory] = (ftvReg[pType].issues[f.issueCategory] || 0) + 1;
        }

        // Weekday vs Weekend
        const dType = f.dayType === "WEEKEND" ? "weekend" : "weekday";
        wkvWk[dType].avgRating += f.rating;
        wkvWk[dType].count++;
        wkvWk[dType].sentiment[sentiment]++;

        // Peak vs Off-Peak
        const tType = f.tripTimeCategory === "PEAK" ? "peak" : "off_peak";
        pvOp[tType].avgRating += f.rating;
        pvOp[tType].count++;
        if (f.issueCategory) {
            pvOp[tType].issues[f.issueCategory] = (pvOp[tType].issues[f.issueCategory] || 0) + 1;
        }
    });

    // Finalize averages
    [ftvReg.first_time, ftvReg.regular, wkvWk.weekday, wkvWk.weekend, pvOp.peak, pvOp.off_peak].forEach(group => {
        if (group.count > 0) group.avgRating /= group.count;
    });

    // Save to DB
    await storage.createCohortInsight({
        organizationId: orgId,
        cohortType: "FIRST_TIME_VS_REGULAR",
        insights: ftvReg
    });

    await storage.createCohortInsight({
        organizationId: orgId,
        cohortType: "WEEKDAY_VS_WEEKEND",
        insights: wkvWk
    });

    await storage.createCohortInsight({
        organizationId: orgId,
        cohortType: "PEAK_VS_OFFPEAK",
        insights: pvOp
    });
}

export async function computeAlerts(orgId: string) {
    const feedback = await storage.getFeedbackByOrg(orgId);
    const alerts: { type: string; message: string; impact: string }[] = [];

    if (feedback.length < 5) return [];

    const recent = feedback.slice(-20);
    const avgSentiment = recent.reduce((acc, f) => acc + (f.sentimentScore || 0.5), 0) / recent.length;

    if (avgSentiment < 0.45) {
        alerts.push({
            type: "CRITICAL",
            message: "Significant sentiment drop detected: Overall passenger satisfaction is below threshold.",
            impact: "High"
        });
    }

    // Peak Hour Negative Spike
    const peakNegative = recent.filter(f => f.tripTimeCategory === "PEAK" && f.rating <= 2).length;
    if (peakNegative >= 3) {
        alerts.push({
            type: "WARNING",
            message: "Peak-hour negative spike detected. Multiple reports of overcrowding and delays.",
            impact: "Medium"
        });
    }

    // Weekend service decline
    const weekendFeedback = feedback.filter(f => f.dayType === "WEEKEND");
    if (weekendFeedback.length > 0) {
        const weekendRating = weekendFeedback.reduce((acc, f) => acc + f.rating, 0) / weekendFeedback.length;
        if (weekendRating < 3.2) {
            alerts.push({
                type: "INFO",
                message: "Weekend service decline: Ratings are significantly lower compared to weekdays.",
                impact: "Medium"
            });
        }
    }

    return alerts;
}
