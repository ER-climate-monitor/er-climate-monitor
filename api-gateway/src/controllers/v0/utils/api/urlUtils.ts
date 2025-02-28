/**
 * URL utility for removing the input service from the input url.
 * @param {string} service - Input service to remove from the url.
 * @param {string} url - Input url.
 * @returns {string} the new url without having the input service inside it.
 */
function removeServiceFromUrl(service: string, url: string): string {
    return url.replace(service, '');
}

export { removeServiceFromUrl };
