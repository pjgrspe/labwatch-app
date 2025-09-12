const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8080;

// Enable CORS for React Native
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, User-Agent');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    server: 'Snapshot Proxy Server',
    version: '1.0.0'
  });
});

// Snapshot capture endpoint
app.get('/snapshot', async (req, res) => {
  const { username, password, ip, port = 554 } = req.query;
  
  console.log(`📷 Snapshot request: ${username}@${ip}:${port}`);
  
  if (!username || !password || !ip) {
    console.error('❌ Missing required parameters');
    return res.status(400).json({ 
      error: 'Missing required parameters: username, password, ip' 
    });
  }
  
  // Build RTSP URL for Tapo cameras
  const rtspUrl = `rtsp://${username}:${password}@${ip}:${port}/stream1`;
  console.log(`🔗 RTSP URL: rtsp://${username}:***@${ip}:${port}/stream1`);
  
  try {
    // Use FFmpeg to capture a single frame
    const ffmpegArgs = [
      '-rtsp_transport', 'tcp',
      '-i', rtspUrl,
      '-vframes', '1',
      '-f', 'image2',
      '-vcodec', 'mjpeg',
      '-q:v', '2',
      '-'
    ];
    
    console.log('🎬 Starting FFmpeg process...');
    const ffmpeg = spawn('ffmpeg', ffmpegArgs);
    
    let imageBuffer = Buffer.alloc(0);
    let errorOutput = '';
    
    // Capture stdout (image data)
    ffmpeg.stdout.on('data', (data) => {
      imageBuffer = Buffer.concat([imageBuffer, data]);
    });
    
    // Capture stderr (error messages)
    ffmpeg.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    // Handle process completion
    ffmpeg.on('close', (code) => {
      if (code === 0 && imageBuffer.length > 0) {
        console.log(`✅ Snapshot captured successfully: ${imageBuffer.length} bytes`);
        
        // Verify JPEG header
        if (imageBuffer[0] === 0xFF && imageBuffer[1] === 0xD8) {
          res.set({
            'Content-Type': 'image/jpeg',
            'Content-Length': imageBuffer.length,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          });
          res.send(imageBuffer);
        } else {
          console.error('❌ Invalid JPEG data received');
          res.status(500).json({ error: 'Invalid image format received' });
        }
      } else {
        console.error(`❌ FFmpeg failed with code ${code}`);
        console.error('❌ FFmpeg stderr:', errorOutput);
        res.status(500).json({ 
          error: 'Failed to capture snapshot',
          details: errorOutput.split('\n').pop() || 'Unknown error',
          code: code
        });
      }
    });
    
    // Handle process errors
    ffmpeg.on('error', (error) => {
      console.error('❌ FFmpeg process error:', error.message);
      res.status(500).json({ 
        error: 'FFmpeg process failed',
        details: error.message
      });
    });
    
    // Set timeout for the request
    setTimeout(() => {
      if (!res.headersSent) {
        ffmpeg.kill('SIGKILL');
        console.error('❌ Snapshot request timeout');
        res.status(408).json({ error: 'Snapshot request timeout' });
      }
    }, 30000); // 30 second timeout
    
  } catch (error) {
    console.error('❌ Snapshot capture error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Snapshot Proxy Server running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET /health - Health check`);
  console.log(`   GET /snapshot?username=X&password=Y&ip=Z&port=554 - Capture snapshot`);
  console.log(`🔧 Make sure FFmpeg is installed and available in PATH`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Snapshot Proxy Server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down Snapshot Proxy Server...');
  process.exit(0);
});
