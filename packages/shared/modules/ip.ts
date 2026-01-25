import { isStrEmpty } from '@shared/modules/validate';
import ipaddr from 'ipaddr.js';

export type IPVersion = 4 | 6 | -1;

export interface IPInfo {
  ip: string;
  version: IPVersion;
  valid: boolean;
}

export interface IPLocation {
  country: string;
  region: string;
  city: string;
  isp: string;
}

export type IP = IPInfo & { location: Partial<IPLocation> };

/**
 * Check ip version
 * @param ip - Value to check
 * @returns IP version (4, 6, or -1 for invalid)
 */
export const checkIpVersion = (ip: string): IPVersion => {
  if (isStrEmpty(ip)) {
    return -1;
  }

  try {
    const ipParse = ipaddr.parse(ip.trim());
    switch (ipParse.kind()) {
      case 'ipv4':
        return 4;
      case 'ipv6':
        return 6;
      default:
        return -1;
    }
  } catch {
    return -1;
  }
};

/**
 * Check if the IP address is valid
 * @param ip - Value to check
 * @returns Whether the IP address is valid
 */
export const isValidIP = (ip: string): boolean => {
  const version = checkIpVersion(ip);
  return version === 4 || version === 6;
};

/**
 * Get basic information about the IP address
 * @param ip - Value to check
 * @returns IP information object
 */
export const getIPInfo = (ip: string): IPInfo => {
  const version = checkIpVersion(ip);
  const valid = isValidIP(ip);

  return {
    ip: ip?.trim() || '',
    version,
    valid,
  };
};

/**
 * Check if the IP address is in the specified CIDR range
 * @param ip - Value to check
 * @param cidr - CIDR notation of the network range
 * @returns Whether the IP address is in the range
 */
export const isIPInRange = (ip: string, cidr: string): boolean => {
  try {
    if (!isValidIP(ip)) {
      return false;
    }

    const addr = ipaddr.parse(ip.trim());
    const [network, prefixLength] = cidr.split('/');

    if (!network || !prefixLength) {
      return false;
    }

    const networkAddr = ipaddr.parse(network.trim());
    const prefix = Number.parseInt(prefixLength, 10);

    if (Number.isNaN(prefix)) {
      return false;
    }

    return addr.match(networkAddr, prefix);
  } catch {
    return false;
  }
};

export default {
  checkIpVersion,
  getIPInfo,
  isIPInRange,
  isValidIP,
};
