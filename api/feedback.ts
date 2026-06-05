import type { VercelRequest, VercelResponse } from "@vercel/node";

const NOTION_DB_ID = "3760cced0b0f80cc935dc3bce679fa44";
const NOTION_VERSION = "2022-06-28";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "method not allowed",
    });
  }

  const token = process.env.NOTION_TOKEN;

  if (!token) {
    return res.status(500).json({
      ok: false,
      error: "missing notion token",
    });
  }

  const { nickname, category, message } = req.body;

  try {
    const notionRes = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parent: {
          database_id: NOTION_DB_ID,
        },
        properties: {
          Nickname: {
            title: [
              {
                text: {
                  content: nickname,
                },
              },
            ],
          },
          Message: {
            rich_text: [
              {
                text: {
                  content: message,
                },
              },
            ],
          },
          Category: {
            select: {
              name: category,
            },
          },
          "Submitted At": {
            date: {
              start: new Date().toISOString(),
            },
          },
        },
      }),
    });

    if (!notionRes.ok) {
      const text = await notionRes.text();

      console.error("Notion error:", text);

      return res.status(500).json({
        ok: false,
        error: "notion request failed",
      });
    }

    return res.status(200).json({
      ok: true,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      error: "server error",
    });
  }
}
