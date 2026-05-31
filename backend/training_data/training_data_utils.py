import pandas as pd
import time
from nba_api.stats.endpoints import teamgamelog
from nba_api.stats.static import teams

def load_all_game_logs(season : str) -> dict:
    """
    Returns {team_abbrev: sorted_game_log_df}
    Season format: '2023-24'
    Takes ~2 mins due to rate limiting
    """

    all_teams = teams.get_teams()
    game_logs = {}

    for index, team in enumerate(all_teams):
        print(f"{index}/30 - {team['full_name']}")
        raw = teamgamelog.TeamGameLog(team_id = team['id'], season=season)
        time.sleep(1.2)

        df = raw.get_data_frames()[0]
        df['GAME_DATE'] = pd.to_datetime(df['GAME_DATE'])
        df = df.sort_values('GAME_DATE').reset_index(drop=True)
        game_logs[team['id']] = df

    return game_logs

def build_master_game_list(logs : dict) -> pd.DataFrame:
    """
    Pulls home-team rows only (MATCHUP contains 'vs.')
    to avoid counting each game twice.
    """

    # abbrev -> id lookup
    abbrev_to_id = {t['abbreviation']: t['id'] for t in teams.get_teams()}
    
    rows = []

    for team_id, df in logs.items():
        home_games = df[df['MATCHUP'].str.contains(r'vs\.', regex=True)]

        for _, row in home_games.iterrows():
            # MATCHUP looks like "LAL vs. GSW"
            away_abbrev = row['MATCHUP'].split('vs. ')[1].strip()
            away_id = abbrev_to_id.get(away_abbrev)

            if away_id is None:
                print(f"Warning: couldn't resolve team abbreviation '{away_abbrev}'")
                continue

            rows.append({
                'game_id':   row['Game_ID'],
                'game_date': row['GAME_DATE'],
                'home':      team_id,
                'away':      away_id,
            })
        
    df_games = (
        pd.DataFrame(rows)
        .drop_duplicates('game_id')
        .sort_values('game_date')
        .reset_index(drop=True)
    )

    return df_games

def rolling_stats(df : pd.DataFrame, before_date : pd.Timestamp) -> dict:
    """
    Win%, home win%, road win%, last-10 win%, days rest
    — all computed from games strictly before before_date.
    Returns None values if no prior games exist.
    """

    prior = df[df['GAME_DATE'] < before_date]

    if prior.empty:
        return dict(win_pct=None, win_pct_home=None, win_pct_road=None, win_pct_l10=None, days_rest=None)
    
    wins = (prior['WL'] == "W").sum()

    home_games = prior[prior['MATCHUP'].str.contains(r'vs\.', regex=True)]
    road_games = prior[prior['MATCHUP'].str.contains('@', regex=False)]

    last_10 = prior.tail(10)
    last_game_date = prior["GAME_DATE"].max()
    days_rest = (before_date - last_game_date).days
    
    return {
        "win_pct" : wins / len(prior),
        "win_pct_home" : (home_games["WL"] == "W").sum() / len(home_games) if len(home_games) > 0 else None,
        "win_pct_road" : (road_games["WL"] == "W").sum() / len(road_games) if len(road_games) > 0 else None,
        "win_pct_l10" : (last_10["WL"] == "W").sum() / len(last_10) if len(last_10) > 0 else None,
        'days_rest':    days_rest
    }

def h2h_diff(home_log: pd.DataFrame, away_log: pd.DataFrame, before_date: pd.Timestamp):
    prior_home = home_log[home_log['GAME_DATE'] < before_date]    
    
    game_ids = prior_home['Game_ID'].tolist()

    # get both teams' points for those games
    home_pts = prior_home[['Game_ID', 'PTS']]
    away_pts = away_log[away_log['Game_ID'].isin(game_ids)][['Game_ID', 'PTS']]

    merged = home_pts.merge(away_pts, on='Game_ID', suffixes=('_home', '_away'))

    if merged.empty: return None

    return (merged['PTS_home'] - merged['PTS_away']).mean()

def abbrev_to_team_id(abbrev : str) -> int:
    """
    Takes in abbreviation (3-character string e.g. MIN) and returns the team's id
    """
    all_teams = teams.get_teams()
    team_id = [team['id'] for team in all_teams if team['abbreviation'] == abbrev][0]
    return team_id


# Build the training data ------------------------
# ------------------------------------------------

def build_training_data(season : str) -> pd.DataFrame:
    game_logs = load_all_game_logs(season)
    
    games = build_master_game_list(game_logs)

    rows = []

    for _, game in games.iterrows():
        home, away, date = game['home'], game['away'], game['game_date']

        home_log = game_logs.get(home)
        away_log = game_logs.get(away)

        if home_log is None or away_log is None: continue

        home_stats = rolling_stats(home_log, date)
        away_stats = rolling_stats(away_log, date)

        # outcome - from home team's log entry for this game
        home_entry = home_log[home_log["Game_ID"] == game['game_id']]
        if home_entry.empty: continue

        home_entry = home_entry.iloc[0]

        rows.append({
            'game_id' : game['game_id'],
            'game_date' : date,
            'home_team' : home,
            'away_team' : away,

            # -- home stats --
            'home_win_pct':       home_stats['win_pct'],
            'home_win_pct_l10':   home_stats['win_pct_l10'],
            'home_win_pct_home':  home_stats['win_pct_home'],
            'home_days_rest':     home_stats['days_rest'],
            'home_h2h_diff':      h2h_diff(home_log, away_log, date),

            # -- away stats --
            'away_win_pct':       away_stats['win_pct'],
            'away_win_pct_l10':   away_stats['win_pct_l10'],
            'away_win_pct_road':  away_stats['win_pct_road'],
            'away_days_rest':     away_stats['days_rest'],
            'away_h2h_diff':      h2h_diff(away_log, home_log, date),

            # -- outcome --
            'home_win':           1 if home_entry['WL'] == 'W' else 0
        })

    return pd.DataFrame(rows)


