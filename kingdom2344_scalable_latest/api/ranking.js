// Vercel Serverless Function
// Required environment variable: MIGHTPULSE_API_KEY

const API = "https://api.mightpulse.com/v1";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const key = process.env.MIGHTPULSE_API_KEY;

  if (!key) {
    return res.status(500).json({
      error: "MIGHTPULSE_API_KEY is not configured in Vercel."
    });
  }

  try {
    const rankUrl =
      `${API}/kingdoms/2344/ranks?board=mystic_trial&limit=20`;

    const rankResponse = await fetch(rankUrl, {
      headers: {
        Authorization: `Bearer ${key}`
      }
    });

    if (!rankResponse.ok) {
      const body = await rankResponse.text();
      return res.status(rankResponse.status).json({
        error: "MightPulse ranking request failed.",
        detail: body.slice(0, 500)
      });
    }

    const rankData = await rankResponse.json();

    // MightPulse may wrap the leaderboard in an object.
    // Normalize the possible response shapes to an array.
   const candidates = [
  rankData,
  rankData?.rows,
  rankData?.players,
  rankData?.leaderboard,
  rankData?.ranks,
  rankData?.board,
  rankData?.board?.rows,
  rankData?.board?.players,
  rankData?.ranks?.rows,
  rankData?.ranks?.players,
  rankData?.data?.rows,
  rankData?.data?.players
];

const board = candidates.find(Array.isArray) || [];

const players = board.slice(0, 20);
    if (!players.length) {
      return res.status(502).json({
        error: "MightPulse returned no ranking rows.",
        detail: "Unexpected leaderboard response shape."
      });
    }

    // Fetch base player data so the alliance abbreviation/name can be displayed.
    const details = await Promise.all(
      players.map(async (p) => {
        const governorId = p.governor_id ?? p.fid ?? p.uid;

        if (governorId == null) {
          return { ...p };
        }

        const playerUrl =
          `${API}/players/${encodeURIComponent(governorId)}?include=base`;

        try {
          const r = await fetch(playerUrl, {
            headers: {
              Authorization: `Bearer ${key}`
            }
          });

          if (!r.ok) {
            return { ...p };
          }

          const d = await r.json();
          const player = d.player || d;

          return {
            ...p,
            nick_name: p.nick_name || player.nick_name,
            alliance: player.alliance || p.alliance
          };
        } catch {
          return { ...p };
        }
      })
    );

    const rows = details
      .map((p) => ({
        nick_name: p.nick_name || "—",
        score: Number(p.score || 0),
        governor_id: p.governor_id ?? p.fid ?? null,
        uid: p.uid ?? null,
        alliance: p.alliance
          ? {
              abbr: p.alliance.abbr || "",
              name: p.alliance.name || ""
            }
          : null
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    res.setHeader(
      "Cache-Control",
      "s-maxage=1800, stale-while-revalidate=3600"
    );
    res.setHeader("Content-Type", "application/json; charset=utf-8");

    return res.status(200).json({
      kingdom: 2344,
      board: "mystic_trial",
      limit: 20,
      rows,
      cachedAt: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({
      error: "Unexpected ranking server error.",
      detail: String(err?.message || err)
    });
  }
}
