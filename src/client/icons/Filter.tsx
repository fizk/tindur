import React from "react";
import classVariantFunction from '../helpers/classVariant';
import './Icon.css';

interface Props {
    classVariant?: string[]
}

export default function Filter({classVariant = []}: Props) {
    return (
        <svg fill="none" height="800px" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
            viewBox="0 0 24 24" className={classVariantFunction('icon', classVariant)}>
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" className="icon-path__stroke"/>
        </svg>
    )
}
