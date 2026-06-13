import { Heading } from "../global_components/Headings";
import styles from "./popup_styles.module.css";
export function Popup({mainContent, headingCopy, isOpen, close}) {
    return (
        <div className={`${!isOpen && styles.inactive} ${styles.popup_wrapper}`}>
            <div className={styles.popup_container}>
                {close && <CloseButton close={close}/>}
                {headingCopy && <Heading contents={headingCopy}/>}
                {mainContent}
            </div>
        </div>
    )
}

export function BlurOverlay({isPopupOpen, onClick}) {
    return <div onClick={onClick} className={`${!isPopupOpen && styles.inactive} ${styles.blur_overlay}`}></div>
}

import closeIcon from "/src/assets/icons/cross.svg";
function CloseButton({close}) {
    return <button 
        className={styles.close_btn}
        onClick={close}
    ><img src={closeIcon}/></button>
}