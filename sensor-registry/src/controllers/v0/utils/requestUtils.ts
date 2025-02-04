function fromBody<X>(body: any, key: string, defaultValue: X): X {
    return body && key in body ? body[key] : defaultValue;
}

function fromHeaders<X>(headers: any, key: string, defaultValue: X): X {
    return headers && key in headers ? headers[key] : defaultValue;
}

export { fromBody, fromHeaders };
