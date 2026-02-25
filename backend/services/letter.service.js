const PDFDocument        = require('pdfkit');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 }     = require('uuid');
const { s3, BUCKET }     = require('../config/s3');
const LetterModel        = require('../models/letter.model');
const GrantRequestModel  = require('../models/grantRequest.model');
const ApprovalModel      = require('../models/approval.model');
const { NotFoundError, ValidationError } = require('../utils/errors');

/**
 * Format a number as INR currency string.
 */
const formatINR = (n) =>
  n != null
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n)
    : 'N/A';

/**
 * Build the H.O. letter PDF in memory and return a Buffer.
 */
function buildLetterPdf(data) {
  return new Promise((resolve, reject) => {
    const doc    = new PDFDocument({ margin: 60, size: 'A4' });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end',  () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const {
      regId, grantId, categoryName, detailName,
      eventName, appliedDate, amountGranted, amountSanctioned,
      hodName, principalName, hodApprovedAt, principalApprovedAt,
      requesterName, requesterDept,
    } = data;

    /* ── Header ── */
    doc.fontSize(14).font('Helvetica-Bold')
       .text('SAIRAM INSTITUTE OF TECHNOLOGY', { align: 'center' });
    doc.fontSize(10).font('Helvetica')
       .text('Sai Leo Nagar, West Tambaram, Chennai – 600 044', { align: 'center' });
    doc.moveDown(0.5);
    doc.moveTo(60, doc.y).lineTo(535, doc.y).stroke();
    doc.moveDown(0.5);

    /* ── Title ── */
    doc.fontSize(13).font('Helvetica-Bold')
       .text('GRANT SANCTIONING LETTER (H.O. LETTER)', { align: 'center' });
    doc.moveDown(1);

    /* ── Meta ── */
    const rowY = doc.y;
    doc.fontSize(10).font('Helvetica-Bold').text('Ref No:', 60, rowY);
    doc.font('Helvetica').text(grantId, 120, rowY);
    doc.font('Helvetica-Bold').text('Date:', 350, rowY);
    doc.font('Helvetica').text(new Date().toLocaleDateString('en-IN'), 390, rowY);
    doc.moveDown(1.5);

    /* ── Body ── */
    doc.fontSize(10).font('Helvetica')
       .text(`To,`)
       .text(`${requesterName}`)
       .text(`Department of ${requesterDept || '—'}`)
       .text(`Sairam Institute of Technology`)
       .moveDown(0.5);

    doc.text(`Sub: Sanction of Grant for ${categoryName} Activity – reg.`)
       .moveDown(0.5);

    doc.text(
      `This is to certify that the grant request bearing Registration ID ` +
      `${regId} and Grant ID ${grantId} submitted for the activity ` +
      `"${eventName || detailName || categoryName}" has been reviewed and sanctioned as follows:`,
      { align: 'justify' }
    );
    doc.moveDown(0.8);

    /* ── Sanction Table ── */
    const tX = 80, col2 = 280, rowH = 20;
    const rows = [
      ['Grant ID',               grantId],
      ['Activity Category',      categoryName],
      ['Activity / Scheme',      detailName || '—'],
      ['Applied Date',           appliedDate ? new Date(appliedDate).toLocaleDateString('en-IN') : '—'],
      ['Amount Applied (INR)',   formatINR(amountGranted)],
      ['Amount Sanctioned (INR)', formatINR(amountSanctioned || amountGranted)],
    ];

    doc.font('Helvetica-Bold').fontSize(10);
    rows.forEach(([label, value], i) => {
      const y = doc.y + (i === 0 ? 0 : rowH * i) - (i > 0 ? rowH * i : 0);
      doc.text(label, tX, doc.y);
      doc.text(value, col2, doc.y - 14);
    });
    doc.moveDown(1);

    /* ── Approval chain ── */
    doc.font('Helvetica').text(
      `This grant has been approved through the following authorization chain:`
    ).moveDown(0.5);

    doc.font('Helvetica-Bold').text('HOD Approval:', 80);
    doc.font('Helvetica')
       .text(`Name: ${hodName || 'N/A'}`, 80)
       .text(`Date: ${hodApprovedAt ? new Date(hodApprovedAt).toLocaleDateString('en-IN') : 'N/A'}`, 80);
    doc.moveDown(0.5);

    doc.font('Helvetica-Bold').text('Principal Approval:', 80);
    doc.font('Helvetica')
       .text(`Name: ${principalName || 'N/A'}`, 80)
       .text(`Date: ${principalApprovedAt ? new Date(principalApprovedAt).toLocaleDateString('en-IN') : 'N/A'}`, 80);
    doc.moveDown(2);

    /* ── Signature Block ── */
    doc.font('Helvetica-Bold')
       .text('CHAIRMAN',    400, doc.y, { align: 'right' })
       .font('Helvetica')
       .text('Sairam Institutions', 400, doc.y, { align: 'right' });

    doc.end();
  });
}

/**
 * Generate and store the H.O. letter for a fully-approved grant request.
 */
async function generateHoLetter(requestId, generatedBy) {
  const request = await GrantRequestModel.findById(requestId);
  if (!request) throw new NotFoundError('Grant request not found');
  if (request.status !== 'APPROVED') {
    throw new ValidationError('Grant request must be fully APPROVED before generating H.O. letter');
  }

  const approvals    = await ApprovalModel.findByRequest(requestId);
  const hodApproval  = approvals.find((a) => a.role === 'HOD');
  const princApproval = approvals.find((a) => a.role === 'PRINCIPAL');

  const pdfBuffer = await buildLetterPdf({
    regId:              request.reg_id,
    grantId:            request.grant_id,
    categoryName:       request.category_name,
    detailName:         request.detail_name,
    eventName:          request.detail_name,
    appliedDate:        null,
    amountGranted:      request.amount_granted_inr,
    amountSanctioned:   request.requested_amount_inr || request.amount_granted_inr,
    hodName:            hodApproval?.decided_by_name,
    principalName:      princApproval?.decided_by_name,
    hodApprovedAt:      hodApproval?.decided_at,
    principalApprovedAt: princApproval?.decided_at,
    requesterName:      request.user_name,
    requesterDept:      request.user_dept,
  });

  const fileName = `HO_Letter_${request.grant_id}_${Date.now()}.pdf`;
  const s3Key    = `letters/${uuidv4()}.pdf`;

  await s3.send(new PutObjectCommand({
    Bucket:      BUCKET,
    Key:         s3Key,
    Body:        pdfBuffer,
    ContentType: 'application/pdf',
  }));

  const letter = await LetterModel.create({
    grantRequestId: requestId,
    letterType:     'HO',
    s3Key,
    fileName,
    contentType:    'application/pdf',
    sizeBytes:      pdfBuffer.length,
    generatedBy,
  });

  return letter;
}

async function getLetters(requestId) {
  return LetterModel.findByRequest(requestId);
}

module.exports = { generateHoLetter, getLetters };
