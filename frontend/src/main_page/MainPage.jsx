import { Heading, Subheading } from "../global_components/Headings"
import styles from "./main_page.module.css"

import NBALogo from "../assets/nba_logo.png";
import { ButtonPrimary } from "../global_components/Buttons";
import { Footer } from "./Footer";

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