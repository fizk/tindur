import React from "react";
import { SubjectLane } from "./SubjectLane";
import type { DragEvent } from "react";
import type { Subject, SubjectGroup } from '../index.d';
import './SubjectDashboard.css';


interface Props {
    subjects: SubjectGroup,
    onUpdate: (subject: Subject) => void, 
    onCreate: (order: number) => void, 
    onDrop: (order: number, event: DragEvent<HTMLUListElement>) => void
}

export default function SubjectDashboard ({subjects, onUpdate, onCreate, onDrop}: Props) {

    return (
        <section className="subject-dashboard__content">
            <SubjectLane subjects={subjects['0']} 
                name={<>TODO <small>({subjects[0].length})</small></>} 
                order={0} 
                onUpdate={onUpdate} 
                onCreate={() => onCreate(0)} 
                onDrop={onDrop} />
            <SubjectLane subjects={subjects['1']} 
                name={<>DOING <small>({subjects[1].length})</small></>} 
                order={1} 
                onUpdate={onUpdate} 
                onCreate={() => onCreate(2)} 
                onDrop={onDrop} />
            <SubjectLane subjects={subjects['2']} 
                expanded={false}
                name={<>DONE <small>({subjects[2].length})</small></>} 
                order={2} 
                onUpdate={onUpdate} 
                onCreate={() => onCreate(2)} 
                onDrop={onDrop} />
        </section>
    )
}