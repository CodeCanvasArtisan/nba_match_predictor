export const nbaTeams = [
  // Empty state
  {
    fullName: "Choose team",
    shortenedName: "",
    abbreviation: "",
    accentColour: "linear-gradient( #DDDDDD, #E6E6E6, to right)",
    secondaryColour: "rgba(0, 0, 0, 0.5)",

  },

  // Atlantic
  { fullName: "Boston Celtics",         shortenedName: "Celtics",       abbreviation: "BOS", accentColour: "#007A33", secondaryColour: "#FFFFFF" },
  { fullName: "Brooklyn Nets",          shortenedName: "Nets",          abbreviation: "BKN", accentColour: "#000000", secondaryColour: "#FFFFFF" },
  { fullName: "New York Knicks",        shortenedName: "Knicks",        abbreviation: "NYK", accentColour: "#006BB6", secondaryColour: "#F58426" },
  { fullName: "Philadelphia 76ers",     shortenedName: "76ers",         abbreviation: "PHI", accentColour: "#00487b", secondaryColour: "#ED174C" },
  { fullName: "Toronto Raptors",        shortenedName: "Raptors",       abbreviation: "TOR", accentColour: "#CE1141", secondaryColour: "#000000" },

  // Central
  { fullName: "Chicago Bulls",          shortenedName: "Bulls",         abbreviation: "CHI", accentColour: "#CE1141", secondaryColour: "#000000" },
  { fullName: "Cleveland Cavaliers",    shortenedName: "Cavaliers",     abbreviation: "CLE", accentColour: "#860038", secondaryColour: "#e8ac2a" },
  { fullName: "Detroit Pistons",        shortenedName: "Pistons",       abbreviation: "DET", accentColour: "#C8102E", secondaryColour: "#1D428A" },
  { fullName: "Indiana Pacers",         shortenedName: "Pacers",        abbreviation: "IND", accentColour: "#002D62", secondaryColour: "#FDBB30" },
  { fullName: "Milwaukee Bucks",        shortenedName: "Bucks",         abbreviation: "MIL", accentColour: "#00471B", secondaryColour: "#EEE1C6" },

  // Southeast
  { fullName: "Atlanta Hawks",          shortenedName: "Hawks",         abbreviation: "ATL", accentColour: "#E03A3E", secondaryColour: "#FFFFFF" },
  { fullName: "Charlotte Hornets",      shortenedName: "Hornets",       abbreviation: "CHA", accentColour: "#37037f", secondaryColour: "#00788C" },
  { fullName: "Miami Heat",             shortenedName: "Heat",          abbreviation: "MIA", accentColour: "#98002E", secondaryColour: "#000000" },
  { fullName: "Orlando Magic",          shortenedName: "Magic",         abbreviation: "ORL", accentColour: "#0077C0", secondaryColour: "#000000" },
  { fullName: "Washington Wizards",     shortenedName: "Wizards",       abbreviation: "WAS", accentColour: "#002B5C", secondaryColour: "#E31837" },

  // Northwest
  { fullName: "Denver Nuggets",         shortenedName: "Nuggets",       abbreviation: "DEN", accentColour: "#0E2240", secondaryColour: "#FEC524" },
  { fullName: "Minnesota Timberwolves", shortenedName: "Timberwolves",  abbreviation: "MIN", accentColour: "#0C2340", secondaryColour: "#00d22a" },
  { fullName: "Oklahoma City Thunder",  shortenedName: "Thunder",       abbreviation: "OKC", accentColour: "#007AC1", secondaryColour: "#EF3B24" },
  { fullName: "Portland Trail Blazers", shortenedName: "Trail Blazers", abbreviation: "POR", accentColour: "#E03A3E", secondaryColour: "#000000" },
  { fullName: "Utah Jazz",              shortenedName: "Jazz",          abbreviation: "UTA", accentColour: "#002B5C", secondaryColour: "#F9A01B" },

  // Pacific
  { fullName: "Golden State Warriors",  shortenedName: "Warriors",      abbreviation: "GSW", accentColour: "#1D428A", secondaryColour: "#FFC72C" },
  { fullName: "Los Angeles Clippers",   shortenedName: "Clippers",      abbreviation: "LAC", accentColour: "#C8102E", secondaryColour: "#1D428A" },
  { fullName: "Los Angeles Lakers",     shortenedName: "Lakers",        abbreviation: "LAL", accentColour: "#552583", secondaryColour: "#FDB927" },
  { fullName: "Phoenix Suns",           shortenedName: "Suns",          abbreviation: "PHX", accentColour: "#1D1160", secondaryColour: "#E56020" },
  { fullName: "Sacramento Kings",       shortenedName: "Kings",         abbreviation: "SAC", accentColour: "#5A2D81", secondaryColour: "#63727A" },

  // Southwest
  { fullName: "Dallas Mavericks",       shortenedName: "Mavericks",     abbreviation: "DAL", accentColour: "#00538C", secondaryColour: "#B8C4CA" },
  { fullName: "Houston Rockets",        shortenedName: "Rockets",       abbreviation: "HOU", accentColour: "#CE1141", secondaryColour: "#C4CED4" },
  { fullName: "Memphis Grizzlies",      shortenedName: "Grizzlies",     abbreviation: "MEM", accentColour: "#12173F", secondaryColour: "#5D76A9" },
  { fullName: "New Orleans Pelicans",   shortenedName: "Pelicans",      abbreviation: "NOP", accentColour: "#0C2340", secondaryColour: "#C8A956" },
  { fullName: "San Antonio Spurs",      shortenedName: "Spurs",         abbreviation: "SAS", accentColour: "#000000", secondaryColour: "#C4CED4" },
];

export function getTeamFromAbbrev(abbrev) {
  if (abbrev == null) return nbaTeams[0];

  return nbaTeams.find(team => team.abbreviation == abbrev) ?? null;
}

export const shiftingCopy = [
  "Looking at season win percentages ...",
  "Fair bit of flopping spotted 🤦‍♂️",
  "Comparing all-star privilege ...",
  "Scanning head-to-head history ...",
  "Preemptively blaming the refs 🙊",
  "Identifying home court advantage",
  "Pretending to understand coaching decisions 🤪",
]