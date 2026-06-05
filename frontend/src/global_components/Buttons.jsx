import 'react';

import styles from "./buttons.module.css";
export function ButtonPrimary({copy, onClick}) {
    return (
        <button 
            onClick={() => onClick()}
            className = {styles.button_primary}
        >
            {copy}
        </button>
    )
}

export function ActionLink({copy, onClick}) {
    
}