export interface Subject {
    id?: number
    subject: string | null
    name: string | null
    description: string | null
    status: number
    date: string
}
export interface SubjectGroup {
    '0': Subject[]
    '1': Subject[]
    '2': Subject[]
}

export interface MutationArgument {
    item: Subject
    form?: FormData
}
