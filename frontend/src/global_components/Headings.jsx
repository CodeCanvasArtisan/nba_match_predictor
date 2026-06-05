import "react";

export function Heading({contents}) {
    return(    
        <h1>
            {contents}
        </h1>
    )
}

export function Subheading({contents}) {
    return (
        <p style = {{textAlign : "center"}}>
            {contents}
        </p>
    )
}