import React, { DragEvent } from "react";
import SubjectList from "./SubjectList";
import { Subject } from "..//index.d";
import './SubjectLane.css';

interface Props {
    subjects: Subject[]
    name: string
    order: number
    expanded?: boolean
    onUpdate: (subject: Subject) => void
    onCreate: (order: number) => void
    onDrop: (order: number, event: DragEvent<HTMLUListElement>) => void
}

export function SubjectLane({subjects, name, order, expanded = true, onCreate, onDrop, onUpdate}: Props) {
    return (
        <>
            <article className="subject-lane">
                <header className="subject-lane__header">
                    <h3 className="subject-lane__title">{name}</h3>
                </header>
                <SubjectList items={subjects} 
                    lane={order}
                    expanded={expanded}
                    onUpdate={onUpdate} 
                    onDrop={onDrop}
                    onDragStart={console.log} />
                <footer className="subject-lane__footer">
                    <button onClick={() => onCreate(order)}>+</button>
                </footer>
            </article>
        </>
    )
}