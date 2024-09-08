import React, { DragEvent } from "react";
import SubjectCard from './SubjectCard';
import type { Subject } from '../index.d';
import './SubjectList.css';

interface Props {
    items: Subject[]
    lane: number
    expanded?: boolean
    onUpdate: (subject: Subject) => void
    onDragStart: (event: DragEvent<HTMLDivElement>) => void
    onDrop: (lane: number, event: DragEvent<HTMLUListElement>) => void
}

export default function SubjectList ({items = [], lane, expanded = true, onUpdate, onDragStart, onDrop}: Props) {
    const handleDragOver = (event: DragEvent<HTMLUListElement>) => {
        event.preventDefault();
    }

    const handleDrop = (event: DragEvent<HTMLUListElement>) => {
        event.preventDefault();
        onDrop(lane, event)
    }
    return (
        <ul className="subject-list" onDragOver={handleDragOver} onDrop={handleDrop}>
            {items.map(subject => (
                <li key={subject.id} className="subject-list__item">
                    <SubjectCard subject={subject} 
                        expanded={expanded}
                        onUpdate={onUpdate} 
                        onDragStart={onDragStart} />
                </li>
            ))}
        </ul>
    )
}