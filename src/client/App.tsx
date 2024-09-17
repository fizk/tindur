import React, { useState } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SubjectDashboard from './components/SubjectDashboard';
import { SubjectTypes } from './SubjectTypes';
import useLocalStorage from './hooks/useLocalStorage';
import type { ChangeEvent, DragEvent } from "react";
import type { Subject, SubjectGroup } from './index.d';
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

const initialData: SubjectGroup = {
    '0': [],
    '1': [],
    '2': [],
}

export default function App ({}) {
    const queryClient = useQueryClient();

    const [storedSelectedDate, setStoredSelectedDate] = useLocalStorage('selectedDate', new Date().toISOString().split('T')[0])
    const [selectedDate, setSelectedDate] = useState<string| string>(storedSelectedDate);

    const [storedSelectedKind, setStoredSelectedKind] = useLocalStorage('selectedKind', 'ALL')
    const [selectedKind, setSelectedKind] = useState<string>(storedSelectedKind);
    const [clientId, setClientId] = useState();

    const { data: subjects } = useQuery({initialData: initialData, queryKey: ['subjects', selectedKind, selectedDate], queryFn: async (): Promise<SubjectGroup> => {

        const params = Object.entries({type: selectedKind, date: selectedDate}).reduce((previous, [key, value]) => {
            if (value === null || value === undefined || value === 'ALL') {
                return previous
            } else {
                return {...previous, ...{[key]: value}}
            }
        }, {});
        
        const queryParam = Object.entries(params).map(([key, value]) => {
            return `${key}=${value}`
        }, []).join('&');

        const fetchConfig = clientId ? {headers: {'x-client-id': clientId}} : {};
        const request = await fetch(`/tindur/api/subjects?${queryParam}`, fetchConfig);
        const response = await request.json();
        return {
            ...initialData,
            ...response,
        };
    }});

    const updateMutation = useMutation({
        retry: false,
        onError: console.log,
        onSettled: (data) => {
            data.response.then(r => {
                if (r.status >= 300) {
                    queryClient.setQueryData(['subjects', selectedKind, selectedDate], data.previous)
                }
            });
        },
        mutationFn: async ({item, form}: MutationArgument): Promise<any>  => {
            const response = fetch(`/tindur/api/subjects/${item.id}`, {
                method: 'PATCH',
                body: form,
                headers: clientId ? {'x-client-id': clientId} : {}
            });

            const previous = queryClient.getQueryData(['subjects', selectedKind, selectedDate]);
            queryClient.setQueryData(['subjects', selectedKind, selectedDate], (old: SubjectGroup) => ({
                0: (old[0] || []).map<Subject>(i => i.id === item.id ? item : i),
                1: (old[1] || []).map<Subject>(i => i.id === item.id ? item : i),
                2: (old[2] || []).map<Subject>(i => i.id === item.id ? item : i),
            }));

            return {previous, response};
        }
    });

    const moveMutation = useMutation({
        retry: false,
        onError: console.log,
        onSettled: (data) => {
            data.response.then(r => {
                if (r.status >= 300) {
                    queryClient.setQueryData(['subjects', selectedKind, selectedDate], data.previous)
                }
            });
        },
        mutationFn: async ({item, form}: MutationArgument): Promise<any>  => {
            const response = fetch(`/tindur/api/subjects/${item.id}`, {
                method: 'PATCH',
                body: form,
                headers: clientId ? {'x-client-id': clientId} : {}
            });

            const previous = queryClient.getQueryData(['subjects', selectedKind, selectedDate]);
            queryClient.setQueryData(['subjects', selectedKind, selectedDate], (old: SubjectGroup) => {

                const reduced = {
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
                };

                reduced[form.get('status') as string] = [
                    item,
                    ...reduced[form.get('status') as string],
                ]

                return reduced;
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
                    
                    const previousQueryData = queryClient.getQueryData<SubjectGroup>(['subjects', selectedKind, selectedDate]);
                    if (!previousQueryData) return;

                    const newData = {
                        ...previousQueryData,
                        [status]: previousQueryData[status].map(item => {
                            return item.id === id ? {...item, id: payload.lastID} : item
                        })
                    }
                    queryClient.setQueryData(['subjects', selectedKind, selectedDate], newData)
                }
            });
        },
        mutationFn: async (form: FormData): Promise<any>  => {
            const response = fetch(`/tindur/api/subjects`, {
                method: 'POST',
                body: form,
                headers: clientId ? {'x-client-id': clientId} : {}
            });

            const optimistic = {
                id: getRandomInt(1000, 999999),
                subject: form.get('subject'),
                name: form.get('name'),
                description: form.get('description'),
                status: form.get('status'),
                date: form.get('date'),
            };

            const previous = queryClient.getQueryData(['subjects', selectedKind, selectedDate]);
            const status: string = form.get('status') as string;
            queryClient.setQueryData(['subjects', selectedKind, selectedDate], (old: SubjectGroup) => {
                return {
                    ...old,
                    [status]: [
                        optimistic,
                        ...old[status] || [],
                    ]
                }
            });

            return {optimistic, previous, response};
        },
    });

    const handleKindChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedKind(event.currentTarget.value);
        setStoredSelectedKind(event.currentTarget.value);
    }

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
    };

    const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(event.currentTarget.value);
        setStoredSelectedDate(event.currentTarget.value);
    }

    // const eventSourceRef = useRef(new EventSource("/tindur/api/register"));
    
    // useEffect(() => {
    //     console.log(eventSource);
    //     const initFunction = (event: MessageEvent) => { 
    //         console.log(event.type, event.data); 
    //         setClientId(event.data);
    //     };
    //     const updateFunction = (event: MessageEvent) => { console.log(event.type, event.data); };
    //     const createFunction = (event: MessageEvent) => { console.log(event.type, event.data); };
    //     const moveFunction = (event: MessageEvent) => { console.log(event.type, event.data); };
    //     const deleteFunction = (event: MessageEvent) => { console.log(event.type, event.data); };

    //     eventSource.addEventListener('init', initFunction);
    //     eventSource.addEventListener('update', updateFunction);
    //     eventSource.addEventListener('create', createFunction);
    //     eventSource.addEventListener('move', moveFunction);
    //     eventSource.addEventListener('error', () => {
    //         eventSource.close();
    //     });

    //     return () => {
    //         eventSource.removeEventListener('init', initFunction);
    //         eventSource.removeEventListener('update', updateFunction);
    //         eventSource.removeEventListener('create', createFunction);
    //         eventSource.removeEventListener('move', moveFunction);
    //     }
    // }, []);

    return (
        <div className="app">
            <nav className="app__navigation"></nav>
            <header className="app__header">
                <svg width="800px" height="800px" viewBox="0 0 971.986 971.986" className="app__icon">
                    <g>
                        <path d="M370.216,459.3c10.2,11.1,15.8,25.6,15.8,40.6v442c0,26.601,32.1,40.101,51.1,21.4l123.3-141.3
                            c16.5-19.8,25.6-29.601,25.6-49.2V500c0-15,5.7-29.5,15.8-40.601L955.615,75.5c26.5-28.8,6.101-75.5-33.1-75.5h-873
                            c-39.2,0-59.7,46.6-33.1,75.5L370.216,459.3z" className="app__icon-path"/>
                    </g>
                </svg>
                <select onChange={handleKindChange} value={selectedKind}>
                    <>
                    <option value="ALL">Allt</option>
                    {Object.entries(SubjectTypes).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                    ))}
                    </>
                </select>
                <input type="date" value={selectedDate} onChange={handleDateChange} />
            </header>
            {clientId}
            <SubjectDashboard subjects={subjects} 
                onCreate={handleCreate} 
                onDrop={handleOnDrop} 
                onUpdate={handleUpdate}/>
        </div>
    )
}