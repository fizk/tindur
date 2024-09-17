import React, { createContext, useState, useEffect } from 'react';

export const SubjectDataContext = createContext<{subjects: any, setSubjects: (data: any) => void}>({
    subjects: {}, 
    setSubjects: (data: any) => {}
});

export function SubjectDataContextWrapper ({children}) {
    const [subjects, setSubjects] = useState<any>(null);

    return (
        <SubjectDataContext.Provider value={{subjects, setSubjects}}>
            {children}
        </SubjectDataContext.Provider>
    )
}
