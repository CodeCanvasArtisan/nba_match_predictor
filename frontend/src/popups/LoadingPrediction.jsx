import styles from "./popup_styles.module.css";

import {useState, useEffect} from "react";

import { shiftingCopy } from "../constants";
import { BouncingBasketball } from "../assets/bouncing_basketball/BouncingBasketball";

export function LoadingPrediction({isActive}) {

    const [isCopyChanging, setIsCopyChanging] = useState(false);
    const [currCopy, setCurrCopy] = useState(shiftingCopy[0]);
    
    const setUpCopyChangeTimer = useEffect(() => {
        
        const copyChangeTimer = setInterval(() => {
            setIsCopyChanging(true)

            setTimeout(() => setCurrCopy(curr => {
                let proposedNew;
                while (true) {
                    proposedNew = shiftingCopy[Math.floor(Math.random() * shiftingCopy.length)]
                    if (proposedNew == curr) continue
                    else break
                }
                return proposedNew

                
            }), 100);

            setTimeout(() => setIsCopyChanging(false), 200);

        }, 3000)

        return () => clearInterval(copyChangeTimer)
    }, [])

 
    return (
        <main className={`${!isActive ? styles.inactive : ""} ${styles.loading_prediction_container}`}>

            <BouncingBasketball/>

            <section className={`${isCopyChanging && styles.changing} ${styles.prediction_copy_container}`}>
                {currCopy}
            </section>
        </main>
    )
}