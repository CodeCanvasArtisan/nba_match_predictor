import styles from "./main_page.module.css"

import { useState, useEffect} from "react";

import NBALogo from "../assets/nba_logo.png";
import { Heading, Subheading } from "../global_components/Headings"

import { ButtonPrimary } from "../global_components/Buttons";
import { Footer } from "./Footer";
import { ParameterSelectionPill } from "./parameter_selection/ParameterSection";
import { MatchupSelection } from "./parameter_selection/MatchupSelection";
import { GameDateSelection } from "./parameter_selection/GameDateSelection";
import { BlurOverlay, Popup } from "../popups/Popup";
import { TeamSelection } from "../popups/TeamSelection";
import { LoadingPrediction } from "../popups/LoadingPrediction";
import { ResultDisplay } from "../popups/ResultDisplay";
import { getTeamFromAbbrev } from "../constants";

import {fetchPrediction} from "/src/api.js";

export function MainPage() {

    const [daysFromNow, setDaysFromNow] = useState(1);
    const [homeTeam, setHomeTeam] = useState("");
    const [awayTeam, setAwayTeam] = useState("");

    const [winInfo, setWinInfo] = useState({
        winningTeam : "LAL",
        winPercent : 67
    })

    const [popupsOpenState, setPopupsOpenState] = useState({
        homeTeam : false,
        awayTeam : false,
        loadingPrediction : false,
        resultsDisplay : false
    })

    const predict = async () => {
        setPopupsOpenState(curr => ({ ...curr, loadingPrediction: true, resultsDisplay: false }));
        
        try {
            const gameDate = new Date();
            gameDate.setDate(gameDate.getDate() + daysFromNow);
            const dateStr = gameDate.toISOString().split("T")[0]; // "2026-06-15"

            const delay = ms => new Promise(res => setTimeout(res, ms));
            await delay(2000);
            const result = await fetchPrediction(homeTeam, awayTeam, dateStr);

            setWinInfo({
                winningTeam: result.home_win_probability >= 0.5 ? homeTeam : awayTeam,
                winPercent: Math.round(
                    result.home_win_probability >= 0.5
                        ? result.home_win_probability * 100
                        : (1 - result.home_win_probability) * 100
                ),
            });

            setPopupsOpenState(curr => ({ ...curr, loadingPrediction: false, resultsDisplay: true }));
        } catch (err) {
            console.error(err);
            setPopupsOpenState(curr => ({ ...curr, loadingPrediction: false }));
            alert("Something went wrong. Maybe try again later.");
        }
    };

    return (
        <>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
        <div className={styles.page_container}>
            <header className={styles.page_header}>
                <div className={styles.main_heading}>
                    <img src={NBALogo}/>
                    <Heading contents="Inbounder"/>
                </div>
                <div className={styles.subheading}>
                    <Subheading contents="Predict the outcome of an NBA regular season matchup based on historic data and trends."/>
                </div>
            </header>

            <section className={styles.parameters_section}>
                <ParameterSelectionPill 
                    paramName="Matchup" 
                    stepNo={1} 
                    mainContent={<MatchupSelection 
                        homeConfig={{variable : homeTeam, setter : setHomeTeam}}
                        awayConfig={{variable : awayTeam, setter : setAwayTeam}}
                        openHomePopup={() => setPopupsOpenState(curr => ({...curr, homeTeam: true}))}
                        openAwayPopup={() => setPopupsOpenState(curr => ({...curr, awayTeam: true}))}

                    />}
                />
                <ParameterSelectionPill 
                    paramName="Game date" 
                    stepNo={2} 
                    mainContent={<GameDateSelection stateConfig={{variable : daysFromNow, setter : setDaysFromNow}}/>}
                />
            </section>

            <section className={styles.submit_section}>
                <ButtonPrimary onClick={() => {
                    if(!homeTeam) {alert("Please choose a home team"); return;}
                    else if (!awayTeam) {alert("Please choose an away team"); return;}

                    (`Matchup : 
                        ${awayTeam} @ ${homeTeam}, 
                        ${daysFromNow == 0 ? "today" : daysFromNow == 1 ? "tomorrow" : `in ${daysFromNow} days' time`}
                    `)
                    predict()
                }}
                copy="Play it out"/>
            </section>

            <section>
                <Footer/>
            </section>

            <Popup 
                headingCopy="Select Away Team" 
                mainContent={<TeamSelection excludedTeams={[homeTeam, awayTeam, ""]} closePopup={() => setPopupsOpenState(curr => ({...curr, awayTeam: false}))} stateConfig={{variable : awayTeam, setter : setAwayTeam}}/>}
                isOpen={popupsOpenState.awayTeam}
                close={() => {setPopupsOpenState(curr => ({...curr, awayTeam: false}))}}
                
            />
            <Popup 
                headingCopy="Select Home Team" 
                mainContent={<TeamSelection excludedTeams={[awayTeam, homeTeam, ""]} closePopup={() => setPopupsOpenState(curr => ({...curr, homeTeam: false}))} stateConfig={{variable : homeTeam, setter : setHomeTeam}}/>}
                isOpen={popupsOpenState.homeTeam}
                close={() => setPopupsOpenState(curr => ({...curr, homeTeam: false}))}          
            />
            <Popup
                mainContent={<>
                    <LoadingPrediction
                        isActive={popupsOpenState.loadingPrediction}
                    /> 
                    <ResultDisplay 
                        closePopup={() => setPopupsOpenState(curr => ({...curr, loadingPrediction: false, resultsDisplay : false}))}
                        rerunPrediction={() => predict()}
                        winPercent={winInfo.winPercent} 
                        winningTeam={getTeamFromAbbrev(winInfo.winningTeam)}
                        isActive={popupsOpenState.resultsDisplay}
                    />
                    </>}
                isOpen={popupsOpenState.loadingPrediction || popupsOpenState.resultsDisplay}
                close={popupsOpenState.loadingPrediction ? 
                    false
                    :
                    () => setPopupsOpenState(curr => ({...curr, loadingPrediction: false, resultsDisplay : false}))
                }
            />
            <BlurOverlay onClick={() => setPopupsOpenState(curr => ({...curr, homeTeam: false, awayTeam: false}))}  isPopupOpen={Object.values(popupsOpenState).some(value => value === true)}/>
        </div>
        </>
    )
}