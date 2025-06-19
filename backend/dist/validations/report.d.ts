import { z } from 'zod';
export declare const generateReportSchema: z.ZodObject<{
    report_type: z.ZodEnum<["activity", "interventions", "clients", "technicians", "performance"]>;
    start_date: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    end_date: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
}, "strip", z.ZodTypeAny, {
    report_type: "activity" | "interventions" | "clients" | "technicians" | "performance";
    start_date?: string | undefined;
    end_date?: string | undefined;
}, {
    report_type: "activity" | "interventions" | "clients" | "technicians" | "performance";
    start_date?: string | undefined;
    end_date?: string | undefined;
}>;
//# sourceMappingURL=report.d.ts.map