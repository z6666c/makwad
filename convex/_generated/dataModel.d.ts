/* eslint-disable */
type Base = { _id: string; _creationTime: number };
type Tables = {
  leads: Base & {
    name: string; company?: string; email: string; types: string[]; plan: string; message: string;
    source: "website" | "client"; status: "new" | "contacted" | "won" | "lost"; isExample?: boolean;
  };
  projects: Base & {
    title: string; clientName: string; clientEmail: string; platform: string;
    stage: number; progress: number; dueDate?: string; isExample?: boolean;
  };
  updates: Base & { projectId: string; text: string; author: "admin" | "client"; authorName: string };
};
export type TableNames = keyof Tables;
export type Doc<T extends TableNames> = Tables[T];
export type Id<T extends string> = string & { __tableName?: T };
