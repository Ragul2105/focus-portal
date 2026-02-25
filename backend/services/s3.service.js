const { GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3, BUCKET } = require('../config/s3');

/**
 * Generate a pre-signed GET URL valid for the specified number of seconds.
 * @param {string} s3Key
 * @param {number} [expiresInSeconds=3600]
 */
const getPresignedUrl = async (s3Key, expiresInSeconds = 3600) => {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: s3Key });
  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
};

/**
 * Delete an object from S3.
 * @param {string} s3Key
 */
const deleteObject = async (s3Key) => {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: s3Key }));
};

module.exports = { getPresignedUrl, deleteObject };
