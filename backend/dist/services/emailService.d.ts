interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}
export declare const sendEmail: (options: EmailOptions) => Promise<void>;
export declare const sendWelcomeEmail: (to: string, name: string) => Promise<void>;
export declare const sendNotificationEmail: (to: string, subject: string, message: string) => Promise<void>;
export {};
//# sourceMappingURL=emailService.d.ts.map