
function isIpValid(ip: string) {
    const regex = /^(?:(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])(\.(?!$)|$)){4}$/
    return regex.test(ip);
}

export { isIpValid }