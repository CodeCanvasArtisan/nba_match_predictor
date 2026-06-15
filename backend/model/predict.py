import torch, pickle
import pandas as pd
import numpy as np
from pathlib import Path

import os, sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import training_data.training_data_utils as Data
from training_data.training_data_utils import abbrev_to_team_id

from model.train_model import NBAPredictorModel

# Loading / saving game logs --------------------
# -----------------------------------------------
import pickle
def save_game_logs(logs, path):
    with open(path, 'wb') as f:
        pickle.dump(logs, f)

def load_game_logs(path):
    with open(path, 'rb') as f:
        return pickle.load(f)


def load_model():
    with open('/model/scaler.pkl', 'rb') as f:
        scaler = pickle.load(f)

    with open('/model/team_to_index.pkl', 'rb') as f:
        team_to_index = pickle.load(f)

    model = NBAPredictorModel()
    model.load_state_dict(torch.load('/model/nba_match_predictor_model.pt'))
    model.eval()

    print("good to go")

    return model, scaler, team_to_index

def startup():

    cache_path = Path('/game_logs.pkl')

    if cache_path.is_file():
        game_logs = load_game_logs(cache_path)
    else:
        game_logs_2425 = Data.load_all_game_logs('2024-25')
        game_logs_2526 = Data.load_all_game_logs('2025-26')

        game_logs = {
            team_id: pd.concat([game_logs_2425[team_id], game_logs_2526[team_id]])
                    .sort_values('GAME_DATE')
                    .reset_index(drop=True)
            for team_id in game_logs_2425
}
        save_game_logs(game_logs, cache_path)

    model, scaler, team_to_index = load_model()
    return model, scaler, team_to_index, game_logs

def predict_match_outcome(
        home_game_log : pd.DataFrame, away_game_log : pd.DataFrame, 
        home_team_id : int, away_team_id : int,
        game_date : pd.Timestamp, 
        scaler, model : NBAPredictorModel, team_to_index
    ):
    """ 
    Parameters:
    - home_game_log - pandas DataFrame of the home team's games this season
    - away_game_log - pandas DataFrame of the away team's games this season
    - game_date - the date of the game being played
    """
    home_rolling_stats = Data.rolling_stats(
        df = home_game_log,
        before_date = game_date
    )
    away_rolling_stats = Data.rolling_stats(
        df = away_game_log,
        before_date = game_date
    )
    home_rolling_stats = {k: (v if v is not None else 0.0) for k, v in home_rolling_stats.items()}
    away_rolling_stats = {k: (v if v is not None else 0.0) for k, v in away_rolling_stats.items()}

    # cap it at 7 days' rest
    MAX_DAYS_REST = 7
    home_rolling_stats['days_rest'] = min(home_rolling_stats['days_rest'], MAX_DAYS_REST)
    away_rolling_stats['days_rest'] = min(away_rolling_stats['days_rest'], MAX_DAYS_REST)

    home_h2h = Data.h2h_diff(
        home_log = home_game_log,
        away_log = away_game_log,
        before_date = game_date
    )
    away_h2h = Data.h2h_diff(
        home_log = away_game_log,
        away_log = home_game_log,
        before_date = game_date
    )
    home_h2h = home_h2h or 0.0
    away_h2h = away_h2h or 0.0

    features = np.array([[
        home_rolling_stats['win_pct'],
        home_rolling_stats['win_pct_l10'],
        home_rolling_stats['win_pct_home'],
        home_rolling_stats['days_rest'],
        home_h2h,
        away_rolling_stats['win_pct'],
        away_rolling_stats['win_pct_l10'],
        away_rolling_stats['win_pct_road'],
        away_rolling_stats['days_rest'],
        away_h2h
    ]])

    print("features:", features)

    # scale it
    features_scaled = scaler.transform(features)
    team_indices = torch.tensor([[team_to_index[home_team_id], team_to_index[away_team_id]]], dtype=torch.long)
    features_tensor = torch.tensor(features_scaled, dtype=torch.float32)

    # predict
    with torch.no_grad():
        prediction = model(features_tensor, team_indices)
    
    return prediction.item()

if __name__ == "__main__":
    # sample prediction
    model, scaler, team_to_index, game_logs = startup()
    home_id = abbrev_to_team_id("OKC")
    away_id = abbrev_to_team_id("SAS")

    result = predict_match_outcome(
        home_game_log = game_logs[home_id],
        away_game_log = game_logs[away_id],
        home_team_id = home_id,
        away_team_id = away_id,
        game_date = pd.Timestamp("2026-05-31"),
        scaler = scaler,
        model = model,
        team_to_index = team_to_index
    )

    print("RESULT -> ", result)

# helpers -----------------------
# -----------------------
def interpret_prediction(y_pred) -> bool:
    """ 
    Returns the an interpretation of the raw prediction - True if home team wins, False otherwise
    """
    return y_pred > 0.5