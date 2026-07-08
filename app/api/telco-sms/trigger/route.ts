// Triggers the "Scrape Telco SMS Consumption" GitHub Actions workflow
// on-demand from the frontend, instead of requiring someone to use GitHub's
// own Actions tab. Needs a GitHub PAT (GITHUB_ACTIONS_PAT) — a
// fine-grained token scoped to only this repo with "Actions: Read and
// write" permission, kept server-side only, never sent to the browser.
const GITHUB_OWNER = "faijulislambd";
const GITHUB_REPO = "adn-widgets";
const WORKFLOW_FILE = "scrape-telco-sms.yml";

export async function POST(request: Request) {
  const token = process.env.GITHUB_ACTIONS_PAT;
  if (!token) {
    return Response.json(
      { error: "GITHUB_ACTIONS_PAT is not configured on the server." },
      { status: 500 },
    );
  }

  let startDate: unknown;
  let endDate: unknown;
  try {
    const body = await request.json();
    startDate = body.startDate;
    endDate = body.endDate;
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (typeof startDate !== "string" || typeof endDate !== "string" || !startDate || !endDate) {
    return Response.json(
      { error: "startDate and endDate are required" },
      { status: 400 },
    );
  }

  if (endDate < startDate) {
    return Response.json(
      { error: "endDate must not be before startDate" },
      { status: 400 },
    );
  }

  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        ref: "main",
        inputs: { start_date: startDate, end_date: endDate },
      }),
    },
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return Response.json(
      { error: `GitHub API request failed: ${res.status} ${detail}` },
      { status: 502 },
    );
  }

  return Response.json({ success: true });
}
