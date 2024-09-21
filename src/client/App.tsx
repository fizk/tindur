import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SubjectDashboard from './components/SubjectDashboard';
import { SubjectTypes } from './SubjectTypes';
import useLocalStorage from './hooks/useLocalStorage';
import getRandomInt from './helpers/getRandomInt';
import type { ChangeEvent, DragEvent } from "react";
import type { Subject, SubjectGroup, MutationArgument } from './index.d';
import './App.css';
import Filter from './icons/Filter';
import Connect from './icons/Connect';
import Disconnect from './icons/Disconnect';

declare global {
    interface Window { eventSource: EventSource | undefined; }
}

const resolveInPlace = (item: Subject) => (old: SubjectGroup) => ({
    0: (old[0] || []).map<Subject>(i => i.id === item.id ? item : i),
    1: (old[1] || []).map<Subject>(i => i.id === item.id ? item : i),
    2: (old[2] || []).map<Subject>(i => i.id === item.id ? item : i),
});

const resolveMove = (item: Subject, status: string) => (old: SubjectGroup) => {
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

    reduced[status] = [
        item,
        ...reduced[status],
    ]

    return reduced;
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
    const [isConnected, setIsConnected] = useState(false);

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
            queryClient.setQueryData(['subjects', selectedKind, selectedDate], resolveInPlace(item));

            return {previous, response};
        }
    });

    const updateServerSendMutation = useMutation({
        retry: false,
        onError: console.log,
        mutationFn: async ({ item }: MutationArgument): Promise<any>  => {
            const previous = queryClient.getQueryData(['subjects', selectedKind, selectedDate]);
            queryClient.setQueryData(['subjects', selectedKind, selectedDate], resolveInPlace(item));

            return {previous};
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
            queryClient.setQueryData(['subjects', selectedKind, selectedDate], resolveMove(item, form?.get('status') as string))

            return {previous, response};
        }
    });
    
    const moveServerSendMutation = useMutation({
        retry: false,
        onError: console.log,
        mutationFn: async ({ item }: MutationArgument): Promise<any>  => {
            const previous = queryClient.getQueryData(['subjects', selectedKind, selectedDate]);
            queryClient.setQueryData(['subjects', selectedKind, selectedDate], resolveMove(item, String(item.status)))
            return {previous};
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
                        [status]: previousQueryData[status].map((item: Subject) => {
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
    
    const createServerSendMutation = useMutation({
        retry: false,
        onError: console.log,
        mutationFn: async ({ item }: MutationArgument): Promise<any>  => {

            const status: string = String(item.status);
            queryClient.setQueryData(['subjects', selectedKind, selectedDate], (old: SubjectGroup) => {
                return {
                    ...old,
                    [status]: [item, ...old[status] || []]
                }
            });

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

        formData.append('id', String(subject.id!));
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
        const data: Subject = JSON.parse(event.dataTransfer.getData('text/plain'));

        const formData = new FormData();

        formData.append('id', String(data.id!));
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
    
    const initFunction = (event: MessageEvent) => { 
        console.log(event.type, event.data); 
        setClientId(event.data);
    };

    const updateFunction = (event: MessageEvent) => { 
        console.log(event.type, event.data); 
        updateServerSendMutation.mutate({item: JSON.parse(event.data)})
    };

    const createFunction = (event: MessageEvent) => { 
        console.log(event.type, event.data); 
        createServerSendMutation.mutate({item: JSON.parse(event.data)});
    };

    const moveFunction = (event: MessageEvent) => { 
        console.log(event.type, event.data); 
        moveServerSendMutation.mutate({item: JSON.parse(event.data)})
    };

    const deleteFunction = (event: MessageEvent) => { 
        console.log(event.type, event.data); 
    };

    useEffect(() => {
        if (!window.eventSource) {
            window.eventSource = new EventSource("/tindur/api/register");
            window.eventSource.addEventListener('open', () => setIsConnected(true));
            window.eventSource.addEventListener('error', event => setIsConnected(false));
            window.eventSource.addEventListener('init', initFunction);
            window.eventSource.addEventListener('update', updateFunction);
            window.eventSource.addEventListener('create', createFunction);
            window.eventSource.addEventListener('move', moveFunction);
        }
    }, []);

    return (
        <div className="app">
            <nav className="app__navigation"></nav>
            <header className="app__header">
                <Filter />
                <select onChange={handleKindChange} value={selectedKind}>
                    <>
                    <option value="ALL">Allt</option>
                    {Object.entries(SubjectTypes).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                    ))}
                    </>
                </select>
                <input type="date" value={selectedDate} onChange={handleDateChange} />
                {isConnected && <Connect />}
                {!isConnected && <Disconnect />}
            </header>
            <SubjectDashboard subjects={subjects} 
                onCreate={handleCreate} 
                onDrop={handleOnDrop} 
                onUpdate={handleUpdate}/>
        </div>
    )
}
