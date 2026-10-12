/* eslint-disable */
type Base = { _id: string; _creationTime: number };
type Metric = { value: string; label: string };
type Tables = {
  leads: Base & {
    name: string; company?: string; email: string; types: string[]; plan: string; message: string;
    source: "website" | "client"; status: "new" | "contacted" | "won" | "lost";
    notes?: string; projectId?: string; isExample?: boolean;
  };
  projects: Base & {
    title: string; clientName: string; clientEmail: string; platform: string;
    stage: number; progress: number; dueDate?: string;
    links?: Array<{ label: string; url: string }>;
    payments?: Array<{ title: string; amount: number; status: "pending" | "due" | "paid" }>;
    isExample?: boolean;
  };
  updates: Base & { projectId: string; text: string; author: "admin" | "client"; authorName: string };
  works: Base & {
    title: string; label: string; text: string; kind: "mobile" | "web" | "both"; art: string; color: string;
    metrics: Metric[]; url?: string; order: number; visible: boolean;
  };
  testimonials: Base & { text: string; name: string; role: string; order: number; visible: boolean };
};
export type TableNames = keyof Tables;
export type Doc<T extends TableNames> = Tables[T];
export type Id<T extends string> = string & { __tableName?: T };
