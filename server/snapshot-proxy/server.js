// Lightweight snapshot proxy using FFmpeg
// GET /snapshot?ip=...&port=554&user=...&pass=...&path=stream1

const http = require('http');
const url = require('url');
const { spawn } = require('child_process');

const PORT = process.env.SNAPSHOT_PROXY_PORT || 8080;

function buildRtspUrl({ ip, port = 554, user, pass, path = 'stream1' }) {
  const auth = user && pass ? `${encodeURIComponent(user)}:${encodeURIComponent(pass)}@` : '';
  return `rtsp://${auth}${ip}:${port}/${path}`;
}

function hasFfmpeg(cb) {
  const proc = spawn('ffmpeg', ['-version']);
  let ok = false;
  proc.on('error', () => cb(false));
  proc.stdout.on('data', () => (ok = true));
  proc.on('close', () => cb(ok));
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  if (parsed.pathname === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  if (parsed.pathname !== '/snapshot') {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const { ip, port, user, pass, path } = parsed.query;
  console.log(`📷 Snapshot request received: ip=${ip}, port=${port}, user=${user ? 'present' : 'missing'}, pass=${pass ? 'present' : 'missing'}, path=${path}`);
  
  if (!ip) {
    console.error('❌ Missing IP parameter');
    res.writeHead(400);
    res.end('Missing ip');
    return;
  }

  hasFfmpeg((available) => {
    if (!available) {
      res.writeHead(500);
      res.end('FFmpeg not available in PATH');
      return;
    }

    const rtsp = buildRtspUrl({ ip, port, user, pass, path });
    console.log(`🔗 Attempting RTSP connection to: rtsp://${user}:***@${ip}:${port}/${path}`);
    
    // Retry logic for FFmpeg snapshot
    const MAX_RETRIES = 2;
    let attempt = 0;
    function trySnapshot() {
      attempt++;
      console.log(`🎬 FFmpeg attempt ${attempt}/${MAX_RETRIES + 1}`);
      
      const args = [
        '-rtsp_transport', 'tcp',
        '-i', rtsp,
        '-frames:v', '1',
        '-vf', 'scale=640:480',
        '-f', 'image2pipe',
        '-q:v', '2',
        '-vcodec', 'mjpeg',
        '-pix_fmt', 'yuvj420p',
        'pipe:1',
      ];
      
      console.log(`⚙️ FFmpeg command: ffmpeg ${args.join(' ')}`);
      const ff = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
      let responded = false;
      let firstChunk = null;
      let sentHeaders = false;
      let errorOutput = '';
      
      const killTimer = setTimeout(() => {
        console.log(`⏰ FFmpeg timeout after 3 seconds on attempt ${attempt}`);
        try { ff.kill('SIGKILL'); } catch {}
      }, 3000); // 3s timeout for fast retry
      
      res.on('close', () => {
        console.log('🔌 Client disconnected, killing FFmpeg');
        clearTimeout(killTimer);
        try { ff.kill('SIGKILL'); } catch {}
      });
      
      // Capture stderr for debugging
      ff.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      ff.on('error', () => {
        console.error(`❌ FFmpeg process error on attempt ${attempt}`);
        if (!responded) {
          responded = true;
          if (attempt < MAX_RETRIES) {
            console.log(`🔄 Retrying... (${attempt + 1}/${MAX_RETRIES + 1})`);
            attempt++;
            trySnapshot();
            return;
          }
          console.error('❌ All FFmpeg attempts failed');
          res.writeHead(500);
          res.end('Failed to start ffmpeg');
        }
      });
      ff.stdout.on('data', chunk => {
        if (!sentHeaders) {
          firstChunk = firstChunk ? Buffer.concat([firstChunk, chunk]) : chunk;
          if (firstChunk.length >= 2 && firstChunk[0] === 0xFF && firstChunk[1] === 0xD8) {
            res.writeHead(200, {
              'Content-Type': 'image/jpeg',
              'Cache-Control': 'no-store',
              'Access-Control-Allow-Origin': '*',
            });
            sentHeaders = true;
            res.write(firstChunk);
          } else if (firstChunk.length > 32) {
            if (!responded) {
              responded = true;
              if (attempt < MAX_RETRIES) {
                attempt++;
                trySnapshot();
                return;
              }
              res.writeHead(500);
              res.end('FFmpeg did not return a valid JPEG');
              ff.kill('SIGKILL');
            }
          }
        } else {
          res.write(chunk);
        }
      });
      ff.stdout.on('end', () => {
        clearTimeout(killTimer);
        if (!sentHeaders && !responded) {
          responded = true;
          if (attempt < MAX_RETRIES) {
            attempt++;
            trySnapshot();
            return;
          }
          res.writeHead(500);
          res.end('No image data');
        } else {
          res.end();
        }
      });
    }
    trySnapshot();
  });
});

server.listen(PORT, () => {
  console.log(`Snapshot proxy listening on http://0.0.0.0:${PORT}`);
});
