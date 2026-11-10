import { z } from "zod";
export declare const OneOnOneInterviewSchema: z.ZodObject<{
    id: z.ZodString;
    interviewerRole: z.ZodDefault<z.ZodString>;
    intervieweeRole: z.ZodString;
    date: z.ZodDefault<z.ZodString>;
    painPoints: z.ZodArray<z.ZodString, "many">;
    technicalDebt: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    featureRequests: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    visionAndAspirations: z.ZodString;
    summary: z.ZodString;
}, "strip", z.ZodTypeAny, {
    date: string;
    id: string;
    summary: string;
    interviewerRole: string;
    intervieweeRole: string;
    painPoints: string[];
    technicalDebt: string[];
    featureRequests: string[];
    visionAndAspirations: string;
}, {
    id: string;
    summary: string;
    intervieweeRole: string;
    painPoints: string[];
    visionAndAspirations: string;
    date?: string | undefined;
    interviewerRole?: string | undefined;
    technicalDebt?: string[] | undefined;
    featureRequests?: string[] | undefined;
}>;
export declare const ManagerFeedbackSchema: z.ZodObject<{
    managerRole: z.ZodString;
    topicId: z.ZodString;
    opinion: z.ZodString;
    concerns: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    proposedTradeOffs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    approvalStatus: z.ZodEnum<["APPROVED", "CONCERNS_RAISED", "BLOCKING"]>;
}, "strip", z.ZodTypeAny, {
    managerRole: string;
    topicId: string;
    opinion: string;
    concerns: string[];
    proposedTradeOffs: string[];
    approvalStatus: "APPROVED" | "CONCERNS_RAISED" | "BLOCKING";
}, {
    managerRole: string;
    topicId: string;
    opinion: string;
    approvalStatus: "APPROVED" | "CONCERNS_RAISED" | "BLOCKING";
    concerns?: string[] | undefined;
    proposedTradeOffs?: string[] | undefined;
}>;
export declare const RfcTopicSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    originatingInterviews: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    problemStatement: z.ZodString;
    proposedSolution: z.ZodString;
    managerFeedbacks: z.ZodDefault<z.ZodArray<z.ZodObject<{
        managerRole: z.ZodString;
        topicId: z.ZodString;
        opinion: z.ZodString;
        concerns: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        proposedTradeOffs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        approvalStatus: z.ZodEnum<["APPROVED", "CONCERNS_RAISED", "BLOCKING"]>;
    }, "strip", z.ZodTypeAny, {
        managerRole: string;
        topicId: string;
        opinion: string;
        concerns: string[];
        proposedTradeOffs: string[];
        approvalStatus: "APPROVED" | "CONCERNS_RAISED" | "BLOCKING";
    }, {
        managerRole: string;
        topicId: string;
        opinion: string;
        approvalStatus: "APPROVED" | "CONCERNS_RAISED" | "BLOCKING";
        concerns?: string[] | undefined;
        proposedTradeOffs?: string[] | undefined;
    }>, "many">>;
    consensusReached: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    title: string;
    id: string;
    originatingInterviews: string[];
    problemStatement: string;
    proposedSolution: string;
    managerFeedbacks: {
        managerRole: string;
        topicId: string;
        opinion: string;
        concerns: string[];
        proposedTradeOffs: string[];
        approvalStatus: "APPROVED" | "CONCERNS_RAISED" | "BLOCKING";
    }[];
    consensusReached: boolean;
}, {
    title: string;
    id: string;
    problemStatement: string;
    proposedSolution: string;
    originatingInterviews?: string[] | undefined;
    managerFeedbacks?: {
        managerRole: string;
        topicId: string;
        opinion: string;
        approvalStatus: "APPROVED" | "CONCERNS_RAISED" | "BLOCKING";
        concerns?: string[] | undefined;
        proposedTradeOffs?: string[] | undefined;
    }[] | undefined;
    consensusReached?: boolean | undefined;
}>;
export declare const ConsensusRfcSchema: z.ZodObject<{
    rfcId: z.ZodString;
    title: z.ZodString;
    authorRole: z.ZodDefault<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<["DRAFT", "IN_CONSULTATION", "ROUNDTABLE_DEBATE", "CONSENSUS_REACHED", "RATIFIED_BY_CTO"]>>;
    sharedVision: z.ZodString;
    topics: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        originatingInterviews: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        problemStatement: z.ZodString;
        proposedSolution: z.ZodString;
        managerFeedbacks: z.ZodDefault<z.ZodArray<z.ZodObject<{
            managerRole: z.ZodString;
            topicId: z.ZodString;
            opinion: z.ZodString;
            concerns: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            proposedTradeOffs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            approvalStatus: z.ZodEnum<["APPROVED", "CONCERNS_RAISED", "BLOCKING"]>;
        }, "strip", z.ZodTypeAny, {
            managerRole: string;
            topicId: string;
            opinion: string;
            concerns: string[];
            proposedTradeOffs: string[];
            approvalStatus: "APPROVED" | "CONCERNS_RAISED" | "BLOCKING";
        }, {
            managerRole: string;
            topicId: string;
            opinion: string;
            approvalStatus: "APPROVED" | "CONCERNS_RAISED" | "BLOCKING";
            concerns?: string[] | undefined;
            proposedTradeOffs?: string[] | undefined;
        }>, "many">>;
        consensusReached: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        id: string;
        originatingInterviews: string[];
        problemStatement: string;
        proposedSolution: string;
        managerFeedbacks: {
            managerRole: string;
            topicId: string;
            opinion: string;
            concerns: string[];
            proposedTradeOffs: string[];
            approvalStatus: "APPROVED" | "CONCERNS_RAISED" | "BLOCKING";
        }[];
        consensusReached: boolean;
    }, {
        title: string;
        id: string;
        problemStatement: string;
        proposedSolution: string;
        originatingInterviews?: string[] | undefined;
        managerFeedbacks?: {
            managerRole: string;
            topicId: string;
            opinion: string;
            approvalStatus: "APPROVED" | "CONCERNS_RAISED" | "BLOCKING";
            concerns?: string[] | undefined;
            proposedTradeOffs?: string[] | undefined;
        }[] | undefined;
        consensusReached?: boolean | undefined;
    }>, "many">;
    resolvedTradeOffs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    signatures: z.ZodDefault<z.ZodArray<z.ZodObject<{
        role: z.ZodString;
        signedAt: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        role: string;
        signedAt: string;
    }, {
        role: string;
        signedAt?: string | undefined;
    }>, "many">>;
    actionableBacklogTickets: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    createdAt: z.ZodDefault<z.ZodString>;
    updatedAt: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "CONSENSUS_REACHED" | "DRAFT" | "IN_CONSULTATION" | "ROUNDTABLE_DEBATE" | "RATIFIED_BY_CTO";
    updatedAt: string;
    title: string;
    createdAt: string;
    authorRole: string;
    rfcId: string;
    sharedVision: string;
    topics: {
        title: string;
        id: string;
        originatingInterviews: string[];
        problemStatement: string;
        proposedSolution: string;
        managerFeedbacks: {
            managerRole: string;
            topicId: string;
            opinion: string;
            concerns: string[];
            proposedTradeOffs: string[];
            approvalStatus: "APPROVED" | "CONCERNS_RAISED" | "BLOCKING";
        }[];
        consensusReached: boolean;
    }[];
    resolvedTradeOffs: string[];
    signatures: {
        role: string;
        signedAt: string;
    }[];
    actionableBacklogTickets: string[];
}, {
    title: string;
    rfcId: string;
    sharedVision: string;
    topics: {
        title: string;
        id: string;
        problemStatement: string;
        proposedSolution: string;
        originatingInterviews?: string[] | undefined;
        managerFeedbacks?: {
            managerRole: string;
            topicId: string;
            opinion: string;
            approvalStatus: "APPROVED" | "CONCERNS_RAISED" | "BLOCKING";
            concerns?: string[] | undefined;
            proposedTradeOffs?: string[] | undefined;
        }[] | undefined;
        consensusReached?: boolean | undefined;
    }[];
    status?: "CONSENSUS_REACHED" | "DRAFT" | "IN_CONSULTATION" | "ROUNDTABLE_DEBATE" | "RATIFIED_BY_CTO" | undefined;
    updatedAt?: string | undefined;
    createdAt?: string | undefined;
    authorRole?: string | undefined;
    resolvedTradeOffs?: string[] | undefined;
    signatures?: {
        role: string;
        signedAt?: string | undefined;
    }[] | undefined;
    actionableBacklogTickets?: string[] | undefined;
}>;
export type OneOnOneInterview = z.infer<typeof OneOnOneInterviewSchema>;
export type ManagerFeedback = z.infer<typeof ManagerFeedbackSchema>;
export type RfcTopic = z.infer<typeof RfcTopicSchema>;
export type ConsensusRfc = z.infer<typeof ConsensusRfcSchema>;
//# sourceMappingURL=rnd.d.ts.map