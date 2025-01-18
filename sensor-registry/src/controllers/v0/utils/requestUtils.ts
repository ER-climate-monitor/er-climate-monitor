function fromBody<X>(body: any, key: string, defaultValue: X): X {
    return body && key in body ? body[key] : defaultValue;
}

export { fromBody };
