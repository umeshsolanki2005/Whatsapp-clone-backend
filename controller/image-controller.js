import grid from 'gridfs-stream';
import mongoose from 'mongoose';

const url = "http://localhost:8000";

let gfs, gridFsBucket;
const conn = mongoose.connection;

conn.once('open', () => {
    gridFsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'fs'
    });
    gfs = grid(conn.db, mongoose.mongo);
    gfs.collection('fs');
});

export const uploadFile = async (request, response) => {
    try {
        if (!request.file) {
            return response.status(404).json({ error: 'File not found' });
        }

        const imageUrl = `${url}/file/${request.file.filename}`;
        return response.status(200).json({ url: imageUrl, filename: request.file.filename });
    } catch (error) {
        console.error('Error in uploadFile:', error);
        return response.status(500).json({ error: error.message });
    }
}

export const getImage = async (request, response) => {
    try {
        // Check if gfs is initialized
        if (!gfs) {
            return response.status(500).json({ error: 'GridFS not initialized' });
        }

        const file = await gfs.files.findOne({ filename: request.params.filename });
        
        // Check if file exists
        if (!file) {
            return response.status(404).json({ error: 'File not found' });
        }

        // Check if file has _id
        if (!file._id) {
            return response.status(500).json({ error: 'File ID not found' });
        }

        // Set appropriate headers
        response.set('Content-Type', file.contentType || 'application/octet-stream');
        response.set('Content-Disposition', `inline; filename="${file.filename}"`);

        const readStream = gridFsBucket.openDownloadStream(file._id);
        
        // Handle stream errors
        readStream.on('error', (error) => {
            console.error('Stream error:', error);
            if (!response.headersSent) {
                return response.status(500).json({ error: 'Error streaming file' });
            }
        });

        readStream.pipe(response);
    } catch (error) {
        console.error('Error in getImage:', error);
        if (!response.headersSent) {
            return response.status(500).json({ error: error.message });
        }
    }
}