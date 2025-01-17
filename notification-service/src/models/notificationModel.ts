interface Topic {
    name: string;
    desc: string;
    queries?: Query[];
}

interface Query {
    name: string;
    desc: string;
}

export { Topic, Query };
