import { request } from '@main/utils/request';
import { getIPInfo, isValidIP } from '@shared/modules/ip';

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
 * Get external IP address
 * @param preferIPv6 Whether to prefer IPv6 address, default is true (prefer IPv6)
 * @returns IP address string, returns empty string on failure
 *
 * @see https://www.ipify.org
 * @see https://ip.sb/api
 * @see https://speed.cloudflare.com
 * @see https://ipapi.is
 */
export const getIP = async (preferIPv6: boolean = true): Promise<string> => {
  const urls = preferIPv6
    ? ['https://ipv6.icanhazip.com', 'https://ipv4.icanhazip.com']
    : ['https://ipv4.icanhazip.com', 'https://ipv6.icanhazip.com'];

  for (const url of urls) {
    try {
      const { data: resp } = await request.request({
        url,
        method: 'GET',
      });

      if (resp && typeof resp === 'string') {
        const ip = resp.trim();
        if (ip && isValidIP(ip)) {
          return ip;
        }
      }
    } catch {
      // ignore errors
    }
  }

  return '';
};

/**
 * Get location information for an IP address
 * @param ip IP address
 * @returns Location information
 */
export const getLocation = async (ip: string): Promise<Partial<IPLocation>> => {
  if (!isValidIP(ip)) return {};

  try {
    const { data: resp } = await request.request({
      url: 'https://ip-scan.browserscan.net/sys/config/ip/get-visitor-ip',
      method: 'GET',
      params: { type: 'ip-api', ip },
    });

    const res = {
      country: resp?.data?.ip_data?.country ?? '',
      region: resp?.data?.ip_data?.region ?? '',
      city: resp?.data?.ip_data?.city ?? '',
      isp: resp?.data?.ip_data?.isp ?? '',
    };
    return res;
  } catch {
    // ignore errors
  }

  return {};
};

/**
 * Get network information (including IP address and related information)
 * @param preferIPv6 Whether to prefer IPv6 address, default is true (prefer IPv6)
 * @returns IP information object
 */
export const getNetwork = async (preferIPv6: boolean = true): Promise<IP> => {
  try {
    const ip = await getIP(preferIPv6);
    if (!ip) {
      return { ip: '', version: -1, valid: false, location: {} };
    }

    const location = await getLocation(ip);
    const info = getIPInfo(ip);
    return { ...info, location };
  } catch {
    return { ip: '', version: -1, valid: false, location: {} };
  }
};

export default {
  getIP,
  getLocation,
  getNetwork,
};
