import { Heading, Subheading } from "../global_components/Headings"
import styles from "./main_page.module.css"

import NBALogo from "../assets/nba_logo.png";
import { ButtonPrimary } from "../global_components/Buttons";
import { Footer } from "./Footer";
import { ParameterSelectionPill } from "./parameter_selection/ParameterSection";
import { MatchupSelection } from "./parameter_selection/MatchupSelection";
import { GameDateSelection } from "./parameter_selection/GameDateSelection";

export function MainPage() {
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
                <ParameterSelectionPill paramName="Matchup" stepNo={1} mainContent={<MatchupSelection/>}/>
                <ParameterSelectionPill paramName="Game date" stepNo={2} mainContent={<GameDateSelection/>}/>
            </section>

            <section className={styles.submit_section}>
                <ButtonPrimary copy="Play it out"/>
            </section>

            <section>
                <Footer/>
            </section>


        </div>
    )
}