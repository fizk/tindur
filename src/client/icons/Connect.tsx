import React from "react";
import classVariantFunction from '../helpers/classVariant';
import './Icon.css';

interface Props {
    classVariant?: string[]
}

export default function Connect({classVariant = []}: Props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" 
            strokeLinejoin="round" className={classVariantFunction('icon', classVariant)}>
            <path d="M5 12.55a11 11 0 0 1 14.08 0" className="icon-path__stroke" />
            <path d="M1.42 9a16 16 0 0 1 21.16 0" className="icon-path__stroke" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" className="icon-path__stroke" />
            <line x1="12" y1="20" x2="12.01" y2="20" className="icon-path__stroke" />
        </svg>
    )
}
