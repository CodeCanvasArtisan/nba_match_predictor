import styles from "./parameter_selection.module.css";
import { getTeamFromAbbrev } from "../../constants";
export function MatchupSelection({homeConfig, awayConfig, openAwayPopup, openHomePopup}) {

    const {variable : homeTeam, setter : setHomeTeam} = homeConfig;
    const {variable : awayTeam, setter : awayTeamTeam} = awayConfig;
    
    return (
        <main className={styles.matchup_selection_container}>
            <div className={styles.top_row}>
                <p>AWAY</p>
                <p style={{color : "rgb(0,0,0,0)", paddingLeft : "0"}}>a</p>
                <p style={{paddingLeft : "2em"}}>HOME</p>
            </div>
            <div className={styles.team_cards_container}>
                <TeamSelectionArea
                    onClick={openAwayPopup}
                    teamObj={getTeamFromAbbrev(awayTeam)}
                />
                <p style={{
                    color : "#FBFBFB80"
                }}>@</p>

                <TeamSelectionArea
                    onClick={openHomePopup}
                    teamObj={getTeamFromAbbrev(homeTeam)}
                />
            </div>
        </main>
    )
}

import basketballIcon from "/src/assets/icons/basketball.svg";
import * as NBALogos from "react-nba-logos"

export function TeamSelectionArea({teamObj, isHome, onClick}) {

    const Logo = teamObj ? (NBALogos[teamObj.abbreviation] ?? null) : null;
    ("team -> ", teamObj);
    return (
        <button 
            onClick={onClick}
            className={styles.team_selection_container}
            style = {{
                background : teamObj.accentColour,
                color : teamObj.secondaryColour,
                border : "solid #FBFBFB80 1px"
            }}
        
        >
            {Logo ? <Logo size="3em" /> : <img src={basketballIcon} />}
            <p style = {{color : teamObj.secondaryColour}}>
                {teamObj.fullName}
                {(teamObj.abbreviation && window.innerWidth > 768) && (
                    ` (${teamObj.abbreviation})`
                )}
            </p>
        </button>
    )
}
