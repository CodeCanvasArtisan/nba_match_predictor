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

export function MainPage() {

    const [daysFromNow, setDaysFromNow] = useState(1);
    const [homeTeam, setHomeTeam] = useState("");
    const [awayTeam, setAwayTeam] = useState("");

    const [popupsOpenState, setPopupsOpenState] = useState({
        homeTeam : false,
        awayTeam : false,
        loadingPrediction : false
    })

    const predict = () => {
        setPopupsOpenState(curr => ({...curr, loadingPrediction : true}))

        
        //setTimeout(() => "/* fetch request */" , 3000) // keep popup onscreen a bit so they can see it


        //.then() - handle result
        // .finally() - change popup 

        // mimic fetch for now
        setTimeout(() => setPopupsOpenState(curr => ({...curr, loadingPrediction : false})), 3000); 
    }   

    return (
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
                    console.log(`Matchup : 
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
                mainContent={<LoadingPrediction/>}
                isOpen={popupsOpenState.loadingPrediction}
                close={() => {
                    if(!confirm("Cancel prediction ?")) return
                    setPopupsOpenState(curr => ({...curr, loadingPrediction: false}))}}
            />
            <BlurOverlay onClick={() => setPopupsOpenState({homeTeam: false, awayTeam: false})}  isPopupOpen={Object.values(popupsOpenState).some(value => value === true)}/>
        </div>
    )
}