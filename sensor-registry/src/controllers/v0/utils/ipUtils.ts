import { isIPv4, isIPv6 } from 'net';

function isIpValid(ip: string) {
    return isIPv4(ip) || isIPv6(ip);
}
export { isIpValid };
