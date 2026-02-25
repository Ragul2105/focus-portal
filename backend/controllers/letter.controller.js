const letterService = require('../services/letter.service');
const S3Service     = require('../services/s3.service');
const { ok, created } = require('../utils/response');

async function generate(req, res, next) {
  try {
    const letter = await letterService.generateHoLetter(req.params.requestId, req.user.id);
    return created(res, letter, 'H.O. letter generated');
  } catch (err) { next(err); }
}

async function list(req, res, next) {
  try {
    const letters = await letterService.getLetters(req.params.requestId);
    return ok(res, letters);
  } catch (err) { next(err); }
}

async function download(req, res, next) {
  try {
    const url = await S3Service.getPresignedUrl(req.params.s3Key);
    return ok(res, { url });
  } catch (err) { next(err); }
}

module.exports = { generate, list, download };
