import tls from 'tls';

export async function getSSLExpiration(domain: string): Promise<Date> {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(443, domain, { servername: domain }, () => {
      const cert = socket.getPeerCertificate();
      if (!cert || !cert.valid_to) {
        return reject(new Error('No valid certificate found.'));
      }
      socket.end();
      resolve(new Date(cert.valid_to));
    });
    socket.on('error', (err) => reject(err));
  });
}
