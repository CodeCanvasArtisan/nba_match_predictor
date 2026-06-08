import styles from "./parameter_selection.module.css";

export function GameDateSelection() {
    return (
        <main className={styles.game_date_selection_wrapper}>
            <div className={styles.game_date_selection_container}>
                <DateOption option="Today"/>
                <DateOption option="Tomorrow"/>
                <DateOption option="inxdays"/>
            </div>
            <div className={styles.selection_box}></div>
        </main>
    )
}

function DateOption({option, isSelected}) {
    return (
        <>
        {option == "inxdays" ?
            <InXDaysOption isSelected={isSelected}/>
            :
            <h2>{option}</h2>
        }
        </>
        
    )
}

import plusIcon from "/src/assets/icons/plus_circle.svg";
import minusIcon from "/src/assets/icons/minus_circle.svg";

function InXDaysOption() {
    return (
        <div className={styles.inxdays_wrapper}>
            <h2>In</h2>
            <span>
                <button><img src={minusIcon}/></button>
                <input value={2}/>
                <button><img src={plusIcon}/></button>
            </span>
            <h2>days</h2>
        </div>
    )
}