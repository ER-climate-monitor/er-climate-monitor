function removeServiceFromUrl(service: string, url: string): string {
    return url.replace(service, "");
}

export { removeServiceFromUrl }