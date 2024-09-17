import React, { createContext, useState, useEffect } from 'react';

export const ClientIdContext = createContext<{clientId: null|string, setClientId: (clientId: string) => void}>({
    clientId: null, 
    setClientId: (clientId: string) => {}
});

export function ClientIdContextWrapper ({children}) {
    const [clientId, setClientId] = useState<string|null>(null);

    return (
        <ClientIdContext.Provider value={{clientId, setClientId}}>
            {children}
        </ClientIdContext.Provider>
    )
}
