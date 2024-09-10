const fs = require('fs');
const path = require('path');

const getMedia = (request, response, fileName, contentType) => {
  const file = path.resolve(__dirname, fileName);

  fs.stat(file, (err, stats) => {
    // First, filter out errors
    if (err) {
      if (err.code === 'ENOENT') {
        response.writeHead(404);
      }
      return response.end(err);
    }
    // Then receive the byte range
    let { range } = request.headers;
    if (!range) {
      range = 'bytes=0-';
    }
    // Parse the byte ranges
    const positions = range.replace(/bytes=/, '').split('-');
    let start = parseInt(positions[0], 10);

    const total = stats.size;
    const end = positions[1] ? parseInt(positions[1], 10) : total - 1;

    if (start > end) {
      start = end - 1;
    }
    // Determine Chunk Size
    const chunkSize = (end - start) + 1;

    response.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Accept-Range': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': contentType,
    });
    // Create a stream
    const stream = fs.createReadStream(file, { start, end });

    stream.on('open', () => {
      stream.pipe(response);
    });

    stream.on('error', (streamErr) => {
      response.end(streamErr);
    });

    return stream;
  });
};

const getParty = (request, response) => {
  getMedia(request, response, '../client/party.mp4', 'media/mp4');
};

const getBird = (request, response) => {
  getMedia(request, response, '../client/bird.mp4', 'media/mp4');
};

const getBling = (request, response) => {
  getMedia(request, response, '../client/bling.mp3', 'media/mp3');
};

module.exports = {
  getParty,
  getBird,
  getBling,
};
