import React from "react";
import classVariantFunction from '../helpers/classVariant';
import './Icon.css';

interface Props {
    classVariant?: string[]
}

export default function Disconnect({classVariant = []}: Props) {
    return (
        <svg fill="none" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
            viewBox="0 0 24 24" className={classVariantFunction('icon', classVariant)}>
            <line x1="1" x2="23" y1="1" y2="23" className="icon-path__stroke"/>
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" className="icon-path__stroke"/>
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" className="icon-path__stroke"/>
            <path d="M10.71 5.05A16 16 0 0 1 22.58 9" className="icon-path__stroke"/>
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" className="icon-path__stroke"/>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" className="icon-path__stroke"/>
            <line x1="12" x2="12.01" y1="20" y2="20" className="icon-path__stroke"/>
        </svg>
    )
}
