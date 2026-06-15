import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler

from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded


from pydantic import BaseModel

from datetime import date
import pandas as pd


from contextlib import asynccontextmanager

import model.predict as Prediction
from training_data.training_data_utils import abbrev_to_team_id

state = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # runs once at startup
    model, scaler, team_to_index, game_logs_2526 = Prediction.startup()
    state['model'] = model
    state['scaler'] = scaler
    state['team_to_index'] = team_to_index
    state['game_logs'] = game_logs_2526
    yield  # server runs here
    # anything after yield runs on shutdown


app = FastAPI(lifespan=lifespan)

raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
allowed_origins = [origin.strip() for origin in raw_origins.split(",")]

print("--- CRITICAL CORS DEBUG ---")
print("Loaded origins from env:", allowed_origins)
print("---------------------------")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # add prod URL when you have it
    allow_methods=["*"],
    allow_headers=["*"],

)
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

class PredictionRequest(BaseModel):
    home_team_abbrev: str
    away_team_abbrev: str
    date: date

@app.post("/prediction")
@limiter.limit("30/minute;200/hour")
def create_prediction(request : PredictionRequest):
    try:
        # convert appreviation to team id
        home_team_id = abbrev_to_team_id(request.home_team_abbrev)
        away_team_id = abbrev_to_team_id(request.away_team_abbrev)
    except Exception as e:
        raise HTTPException(404, "Error getting ids -> ", e)
    
    
    result = Prediction.predict_match_outcome(
        home_game_log=state['game_logs'][home_team_id],
        away_game_log=state['game_logs'][away_team_id],
        home_team_id=home_team_id,
        away_team_id=away_team_id,
        game_date=pd.Timestamp(str(request.date)),
        scaler=state['scaler'],
        model=state['model'],
        team_to_index=state['team_to_index']
    )
    return {"home_win_probability": result}