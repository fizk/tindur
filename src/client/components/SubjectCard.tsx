import React, { ChangeEvent, DragEvent, KeyboardEvent, useState } from "react";
import classVariant from '../helpers/classVariant';
import { SubjectTypes } from '../SubjectTypes';
import Markdown from "react-markdown";
import type { Subject } from '../index.d';
import './SubjectCard.css'

interface Props {
    subject: Subject
    expanded: boolean
    onUpdate: (subject: Subject) => void
    onDragStart: (event: DragEvent<HTMLDivElement>) => void
}

export default function SubjectCard ({subject, expanded = true, onUpdate, onDragStart}: Props) {
    const [name, setName] = useState(subject.name);
    const [nameActive, setNameActive] = useState(false);

    const [kind, setKind] = useState(subject.subject);
    const [kindActive, setKindActive] = useState(false);

    const [date, setDate] = useState<string>(String(subject.date));
    const [dateActive, setDateActive] = useState(false);

    const [description, setDescription] = useState(subject.description);
    const [descriptionActive, setDescriptionActive] = useState(false);

    const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
        setName(event.currentTarget.value)
    };
    const handleNameChangeEnd = (event: ChangeEvent<HTMLInputElement>) => {
        setNameActive(false);
        onUpdate({
            id: subject.id,
            subject: kind,
            name: name,
            description: description,
            status: subject.status,
            date: date
        });
    };
    const handleNameChangeEnterEnd = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.code === 'Enter') {
            setNameActive(false);
            onUpdate({
                id: subject.id,
                subject: kind,
                name: name,
                description: description,
                status: subject.status,
                date: date
            });
        }
    };
    const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
        setDate(event.currentTarget.value)
    };
    const handleDateChangeEnd = (event: ChangeEvent<HTMLInputElement>) => {
        setDateActive(false);
        onUpdate({
            id: subject.id,
            subject: kind,
            name: name,
            description: description,
            status: subject.status,
            date: date
        });
    };
    const handleDateChangeEnterEnd = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.code === 'Enter') {
            setDateActive(false);
            onUpdate({
                id: subject.id,
                subject: kind,
                name: name,
                description: description,
                status: subject.status,
                date: date
            });
        }
    };
    const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(event.currentTarget.value)
    };
    const handleDescriptionChangeEnd = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setDescriptionActive(false);
        onUpdate({
            id: subject.id,
            subject: kind,
            name: name,
            description: description,
            status: subject.status,
            date: date
        });
    };
    const handlKindChange = (event: ChangeEvent<HTMLSelectElement>) => {
        if (event.currentTarget.value === '' || !event.currentTarget.value) return;

        setKind(event.currentTarget.value);
        setKindActive(false);
        onUpdate({
            id: subject.id,
            subject: event.currentTarget.value,
            name: name,
            description: description,
            status: subject.status,
            date: date
        });
    };

    const handleDragStart = (event: DragEvent<HTMLDivElement>) => {
        event.dataTransfer.setData('text/plain', JSON.stringify({
            ...subject,
            name,
            subject: kind,
            date,
            description,
        }));
        onDragStart(event);
    }

    return (
        <>
        <div className={classVariant('subject-card', [subject.subject?.toLowerCase() || ''])} draggable={true} onDragStart={handleDragStart}>
            <header>
                {nameActive && (
                    <div>
                        <input value={name || ''} 
                            onChange={handleNameChange} 
                            onBlur={handleNameChangeEnd} 
                            onKeyDown={handleNameChangeEnterEnd} 
                            autoFocus />
                    </div>
                )}
                {!nameActive && (
                    <h3 className={classVariant('subject-card__title', name ? [] : ['disabled'])} 
                        onDoubleClick={() => setNameActive(true)}>
                            {name || 'Missing title'}
                    </h3>
                )}
            </header>
            <aside className="subject-card__aside">
                {kindActive && (
                    <select onChange={handlKindChange} value={kind || ''}>
                        <option value={''}>Veldu fag</option>
                        {Object.entries(SubjectTypes).map(([key, value]) => (
                            <option key={key} value={key}>{value}</option>
                        ))}
                    </select>
                )}
                {!kindActive && (
                    <h4 className={classVariant('subject-card__kind', kind?[]:['disabled'])} onDoubleClick={() => setKindActive(true)}>
                        {kind || 'Vantar fag'}
                    </h4>
                )}
                {dateActive && (    
                    <div>
                        <input value={date} 
                            type="date" 
                            onChange={handleDateChange} 
                            onBlur={handleDateChangeEnd} 
                            onKeyDown={handleDateChangeEnterEnd} 
                            autoFocus/>
                    </div>
                )}
                {!dateActive && (
                    <time className="subject-card__time" 
                        onDoubleClick={() => setDateActive(true)}>
                            {date && Intl.DateTimeFormat('en-GB', {month:'short', weekday: 'short', day: 'numeric'}).format(new Date(date))}
                    </time>
                )}
            </aside>
            {descriptionActive && (
                <textarea value={description || ''}
                    className="subject-card__textarea" 
                    onChange={handleDescriptionChange} 
                    onBlur={handleDescriptionChangeEnd} 
                    autoFocus />
            )}
            {!descriptionActive && (
                <>
                {expanded === false && (
                    <details className="subject-card__details">
                        <summary>Meira</summary>
                        <Markdown>{description || 'Vantar lýsingu'}</Markdown>
                    </details>
                )}
                {expanded === true && (
                    <div onDoubleClick={() => setDescriptionActive(true)} 
                        className={classVariant('subject-card__description', description?[]:['disabled'])}>
                        <Markdown>{description || 'Vantar lýsingu'}</Markdown>
                    </div>
                )}
                </>
            )}
        </div>
        </>
    )
}