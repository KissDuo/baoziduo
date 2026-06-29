import { Router } from 'express';
import geoip from 'geoip-lite';

const router = Router();

router.get('/', (req, res) => {
  // Get IP: prefer x-forwarded-for (behind proxy/nginx), fallback to connection remoteAddress
  const forwarded = req.headers['x-forwarded-for'];
  let ip = '127.0.0.1';
  if (typeof forwarded === 'string') {
    ip = forwarded.split(',')[0]!.trim();
  } else if (Array.isArray(forwarded) && forwarded[0]) {
    ip = forwarded[0];
  } else if (req.socket.remoteAddress) {
    ip = req.socket.remoteAddress;
  }

  // Strip IPv6 prefix if present (e.g. "::ffff:192.168.1.1" → "192.168.1.1")
  const cleanIp = ip.replace(/^::ffff:/, '');

  // Private / local IPs — can't determine country, default to China (conservative)
  const isPrivate = cleanIp === '127.0.0.1' || cleanIp === '::1'
    || cleanIp.startsWith('192.168.') || cleanIp.startsWith('10.')
    || cleanIp.startsWith('172.16.') || cleanIp.startsWith('172.17.')
    || cleanIp.startsWith('172.18.') || cleanIp.startsWith('172.19.')
    || cleanIp.startsWith('172.20.') || cleanIp.startsWith('172.21.')
    || cleanIp.startsWith('172.22.') || cleanIp.startsWith('172.23.')
    || cleanIp.startsWith('172.24.') || cleanIp.startsWith('172.25.')
    || cleanIp.startsWith('172.26.') || cleanIp.startsWith('172.27.')
    || cleanIp.startsWith('172.28.') || cleanIp.startsWith('172.29.')
    || cleanIp.startsWith('172.30.') || cleanIp.startsWith('172.31.');

  const geo = isPrivate ? null : geoip.lookup(cleanIp);
  const country = geo?.country || (isPrivate ? 'CN' : 'XX');

  res.json({ ip: cleanIp, country, isChina: country === 'CN' });
});

export default router;
