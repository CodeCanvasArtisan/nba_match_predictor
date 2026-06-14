const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchPrediction(homeTeamAbbrev, awayTeamAbbrev, date) {
    const response = await fetch(`${BASE_URL}/prediction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            home_team_abbrev: homeTeamAbbrev,
            away_team_abbrev: awayTeamAbbrev,
            date: date,
        }),
    });

    if (!response.ok) throw new Error(`Prediction failed: ${response.status}`);
    return response.json(); // { home_win_probability: 0.67 }
}