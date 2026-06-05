import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const NOTION_DB_ID = "3760cced0b0f80cc935dc3bce679fa44";
const NOTION_VERSION = "2022-06-28";

export const CATEGORIES = [
  "Praise",
  "Bug report",
  "Feature request",
  "Question",
  "General",
  "Other",
] as const;

const FeedbackSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(1, "nickname required")
    .max(40, "nickname too long")
    .regex(/^[a-zA-Z0-9 _.-]+$/, "letters, numbers, space, . _ - only"),
  category: z.enum(CATEGORIES),
  message: z
    .string()
    .trim()
    .min(5, "message too short")
    .max(2000, "message too long"),
});

export const submitFeedback = createServerFn({ method: "POST" })
  .inputValidator((input) => FeedbackSchema.parse(input))
  .handler(async ({ data }) => {
    const token = process.env.NOTION_TOKEN;
    if (!token) {
      return { ok: false as const, error: "server not configured" };
    }

    const body = {
      parent: { database_id: NOTION_DB_ID },
      properties: {
        Nickname: {
          title: [{ text: { content: data.nickname } }],
        },
        Message: {
          rich_text: [{ text: { content: data.message } }],
        },
        Category: {
          select: { name: data.category },
        },
        "Submitted At": {
          date: { start: new Date().toISOString() },
        },
      },
    };

    try {
      const res = await fetch("https://api.notion.com/v1/pages", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Notion-Version": NOTION_VERSION,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error(`Notion API error [${res.status}]:`, text);
        if (res.status === 404) {
          return {
            ok: false as const,
            error: "database not shared with integration",
          };
        }
        if (res.status === 400) {
          return {
            ok: false as const,
            error: "database schema mismatch — check column names",
          };
        }
        return { ok: false as const, error: `notion error (${res.status})` };
      }

      return { ok: true as const };
    } catch (err) {
      console.error("Feedback submit failed:", err);
      return { ok: false as const, error: "network error, try again" };
    }
  });
