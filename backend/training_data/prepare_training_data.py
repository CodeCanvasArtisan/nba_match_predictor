import pandas as pd
import time
from nba_api.stats.endpoints import teamgamelog
from nba_api.stats.static import teams
from training_data.training_data_utils import *

def export_training_data():
    data_2024_25 = build_training_data(season = "2024-25") # previous season
    data_2025_26 = build_training_data(season = "2025-26") # current season

    
    training_data = pd.concat([data_2024_25, data_2025_26], ignore_index=True)
    training_data = training_data.dropna()
    training_data.to_csv('/training_data/training_data.csv', index=False)

if __name__ == "__main__":
    export_training_data()