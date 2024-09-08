import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SubjectList from './components/SubjectList';
import { SubjectTypes } from './SubjectTypes';
import type { ChangeEvent, DragEvent } from "react";
import type { Subject, SubjectGroup } from './index.d';
import './fonts/futura/Futura-Light-Italic.woff';
import './fonts/futura/Futura-Bold-Italic.woff';
import './fonts/futura/Futura-Bold.woff';
import './fonts/futura/Futura-Book-Italic.woff';
import './fonts/futura/Futura-Book.woff';
import './fonts/futura/Futura-Light.woff';
import './fonts/futura/Futura-Medium-Italic.woff';
import './fonts/futura/Futura-Medium.woff';
import './images/tinds.jpg';
import './App.css';


function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface MutationArgument {
    item: Subject
    form: FormData
}

const initialData = {
    '0': [],
    '1': [],
    '2': [],
}

export default function App () {
    const queryClient = useQueryClient();
    const [selectedKind, setSelectedKind] = useState<string>('ALL');

    const { data: subjects } = useQuery({initialData: initialData, queryKey: ['subjects', selectedKind], queryFn: async (): Promise<SubjectGroup> => {
        const url = (selectedKind !== 'ALL') ? `/tindur/api/subjects?type=${selectedKind}` : `/tindur/api/subjects`;
        const request = await fetch(url);
        const response = request.json();
        return response;
    }});

    const updateMutation = useMutation({
        retry: false,
        onError: console.log,
        onSettled: (data, error, variables, context) => {
            data.response.then(r => {
                if (r.status >= 300) {
                    queryClient.setQueryData(['subjects'], data.previous)
                }
            });
        },
        mutationFn: async ({item, form}: MutationArgument): Promise<any>  => {
            const response = fetch(`/tindur/api/subjects/${item.id}`, {
                method: 'PATCH',
                body: form
            });

            const previous = queryClient.getQueryData(['subjects', selectedKind]);
            queryClient.setQueryData(['subjects'], (old: Subject[]) => (
                old.map((i: Subject) => (
                    i.id === item.id ? item : i
                ))
            ));

            return {previous, response};
        }
    });

    const moveMutation = useMutation({
        retry: false,
        onError: console.log,
        onSettled: (data, error, variables, context) => {
            data.response.then(r => {
                if (r.status >= 300) {
                    queryClient.setQueryData(['subjects'], data.previous)
                }
            });
        },
        mutationFn: async ({item, form}: MutationArgument): Promise<any>  => {
            const response = fetch(`/tindur/api/subjects/${item.id}`, {
                method: 'PATCH',
                body: form
            });

            const previous = queryClient.getQueryData(['subjects', selectedKind]);
            queryClient.setQueryData(['subjects', selectedKind], (old: SubjectGroup) => {

                const newData = {
                    0: (old[0] || []).reduce<Subject[]>((previous, current) => {
                        return (current.id === item.id) 
                            ? previous 
                            : [...previous, current];
                    }, []),
                    1: (old[1] || []).reduce<Subject[]>((previous, current) => {
                        return (current.id === item.id) 
                            ? previous 
                            : [...previous, current];
                    }, []),
                    2: (old[2] || []).reduce<Subject[]>((previous, current) => {
                        return (current.id === item.id) 
                            ? previous 
                            : [...previous, current];
                    }, []),
                }

                newData[form.get('status') as string] = [
                    item,
                    ...newData[form.get('status') as string],
                ]

                return newData;
            });

            return {previous, response};
        }
    });
    
    const createMutation = useMutation({
        retry: false,
        onError: console.log,
        onSettled: (data, error, variables, context) => {
            data.response.then(async (r) => {
                if (r.status < 300) {
                    const payload = await r.json();
                    const id = data.optimistic.id;
                    const status = Number(data.optimistic.status);
                    
                    const previousQueryData = queryClient.getQueryData<SubjectGroup>(['subjects', selectedKind]);
                    if (!previousQueryData) return;

                    const newData = {
                        ...previousQueryData,
                        [status]: previousQueryData[status].map(item => {
                            return item.id === id ? {...item, id: payload.lastID} : item
                        })
                    }
                    queryClient.setQueryData(['subjects', selectedKind], newData)
                }
            });
        },
        mutationFn: async (form: FormData): Promise<any>  => {
            const response = fetch(`/tindur/api/subjects`, {
                method: 'POST',
                body: form,
            });

            const optimistic = {
                id: getRandomInt(1000, 999999),
                subject: form.get('subject'),
                name: form.get('name'),
                description: form.get('description'),
                status: form.get('status'),
                date: form.get('date'),
            };

            const previous = queryClient.getQueryData(['subjects', selectedKind]);
            const status: string = form.get('status') as string;
            queryClient.setQueryData(['subjects', selectedKind], (old: any[]) => {
                return {
                    ...old,
                    [status]: [
                        optimistic,
                        ...old[status],
                    ]
                }
            });

            return {optimistic, previous, response};
        },
    });

    const handleKindChange = (event: ChangeEvent<HTMLSelectElement>) => setSelectedKind(event.currentTarget.value);

    const handleCreate = (status: number) => {
        const formData = new FormData();

        const [day] = new Date().toISOString().split('T');

        formData.append('subject', '');
        formData.append('name', 'Titill');
        formData.append('description', '');
        formData.append('status', String(status));
        formData.append('date', day);

        createMutation.mutate(formData);
    };

    const handleUpdate = (subject: Subject) => {
        const formData = new FormData();

        formData.append('id', subject.id!);
        formData.append('subject', subject.subject!);
        formData.append('name', subject.name!);
        formData.append('description', subject.description!);
        formData.append('status', String(subject.status));
        formData.append('date', subject.date);

        updateMutation.mutate({
            item: subject,
            form: formData
        });
    };

    const handleOnDragStart = (event: DragEvent<HTMLDivElement>) => {
        // console.log('drag', event.dataTransfer.getData('text/plain'))
    }
    const handleOnDrop = (lane: number, event: DragEvent<HTMLUListElement>) => {
        // console.log(`drop lane: ${lane}`, event.dataTransfer.getData('text/plain'))

        const data: Subject = JSON.parse(event.dataTransfer.getData('text/plain'));

        const formData = new FormData();

        formData.append('id', data.id!);
        formData.append('status', String(lane));

        moveMutation.mutate({
            item: data,
            form: formData
        });
    }

    return (
        <div className="stream">
            <nav className="stream__navigation">
                <img src="/tindur/images/tinds.jpg" />
            </nav>
            <header className="stream__header">
                <svg width="800px" height="800px" viewBox="0 0 971.986 971.986" className="stream__icon">
                    <g>
                        <path d="M370.216,459.3c10.2,11.1,15.8,25.6,15.8,40.6v442c0,26.601,32.1,40.101,51.1,21.4l123.3-141.3
                            c16.5-19.8,25.6-29.601,25.6-49.2V500c0-15,5.7-29.5,15.8-40.601L955.615,75.5c26.5-28.8,6.101-75.5-33.1-75.5h-873
                            c-39.2,0-59.7,46.6-33.1,75.5L370.216,459.3z" className="stream__icon-path"/>
                    </g>
                </svg>
                <select onChange={handleKindChange}>
                    <>
                    <option value="ALL">Allt</option>
                    {Object.entries(SubjectTypes).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                    ))}
                    </>
                </select>
            </header>
            <article className="stream__lane">
                <header className="stream__header">
                    <h3 className="stream__title">Todo</h3>
                </header>
                <SubjectList items={subjects['0']} 
                    lane={0}
                    onUpdate={handleUpdate} 
                    onDrop={handleOnDrop}
                    onDragStart={handleOnDragStart} />
                <footer className="stream__footer">
                    <button onClick={() => handleCreate(0)}>+</button>
                </footer>
            </article>
            <article className="stream__lane">
                <header className="stream__header">
                    <h3 className="stream__title">Doing</h3>
                </header>
                <SubjectList items={subjects['1']} 
                    lane={1}
                    onUpdate={handleUpdate} 
                    onDrop={handleOnDrop}
                    onDragStart={handleOnDragStart} />
                <footer className="stream__footer">
                <button onClick={() => handleCreate(1)}>+</button>
                </footer>
            </article>
            <article className="stream__lane">
                <header className="stream__header">
                    <h3 className="stream__title">Done</h3>
                </header>
                <SubjectList items={subjects['2']} 
                    lane={2}
                    expanded={false}
                    onUpdate={handleUpdate} 
                    onDrop={handleOnDrop}
                    onDragStart={handleOnDragStart} />
                <footer className="stream__footer">
                    <button onClick={() => handleCreate(2)}>+</button>
                </footer>
            </article>
        </div>
    )
}