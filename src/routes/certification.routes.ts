import { Router } from 'express';
import CertificationController from '../controllers/certification.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const certificationController = new CertificationController();

/**
 * @swagger
 * components:
 *   schemas:
 *     Certification:
 *       type: object
 *       required:
 *         - nomor_registrasi
 *         - pemohon_id
 *         - rekomendasi_id
 *         - komoditas_id
 *         - tipe
 *         - jumlah_benih
 *         - satuan
 *         - varietas
 *         - status
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Certification ID
 *         nomor_registrasi:
 *           type: string
 *           description: Registration number (auto-generated)
 *         nomor_surat_sertifikat:
 *           type: string
 *           description: Certificate number
 *         tanggal_surat_sertifikat:
 *           type: string
 *           format: date
 *           description: Certificate date
 *         tanggal_expired_sertifikat:
 *           type: string
 *           format: date
 *           description: Certificate expiry date
 *         pemohon_id:
 *           type: string
 *           format: uuid
 *           description: Applicant ID
 *         rekomendasi_id:
 *           type: string
 *           format: uuid
 *           description: Recommendation ID
 *         komoditas_id:
 *           type: string
 *           format: uuid
 *           description: Commodity ID
 *         tipe:
 *           type: string
 *           enum: [siaptanam, pratanam]
 *           description: Certification type
 *         jumlah_benih:
 *           type: number
 *           description: Seed quantity
 *         satuan:
 *           type: string
 *           description: Unit
 *         varietas:
 *           type: string
 *           description: Variety
 *         status:
 *           type: integer
 *           enum: [1, 2, 3, 4, 5, 6, 7]
 *           description: Status (1-Verifikasi Dokumen, 2-Penjadwalan, 3-Verifikasi Lapangan, 4-Pengesahan, 5-Penerbitan, 6-Selesai, 7-Ditolak)
 *         catatan_administrasi:
 *           type: string
 *           description: Administrative notes
 *         catatan_pemeriksaan:
 *           type: string
 *           description: Inspection notes
 *         catatan_validasi:
 *           type: string
 *           description: Validation notes
 *         pemeriksa:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           description: Inspector user IDs
 *         tanggal_jadwal_pemeriksaan:
 *           type: string
 *           format: date-time
 *           description: Inspection schedule date
 *         tanggal_pemeriksaan:
 *           type: string
 *           format: date-time
 *           description: Actual inspection date
 *         file_surat_sertifikat:
 *           type: string
 *           description: Certificate file path
 *         file_asal_benih:
 *           type: string
 *           description: Seed origin file path
 *         file_dokumen_pendukung:
 *           type: string
 *           description: Supporting document file path
 */

/**
 * @swagger
 * /api/certifications:
 *   get:
 *     summary: Get all certifications
 *     description: Get certifications based on user role. Pemohon sees their own, inspektur sees assigned ones, others see all.
 *     tags: [Certifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *           enum: [1, 2, 3, 4, 5, 6, 7]
 *         description: Filter by status
 *       - in: query
 *         name: tipe
 *         schema:
 *           type: string
 *           enum: [siaptanam, pratanam]
 *         description: Filter by type
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in registration number, certificate number, or variety
 *     responses:
 *       200:
 *         description: List of certifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Certification'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     itemsPerPage:
 *                       type: integer
 */
router.get('/', authenticateToken, (req, res) => certificationController.getAllCertifications(req, res));

/**
 * @swagger
 * /api/certifications:
 *   post:
 *     summary: Create new certification
 *     description: Create new certification (only by petani or perusahaan)
 *     tags: [Certifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - rekomendasi_id
 *               - komoditas_id
 *               - jumlah_benih
 *               - satuan
 *               - varietas
 *               - tipe
 *             properties:
 *               rekomendasi_id:
 *                 type: string
 *                 format: uuid
 *                 description: Recommendation ID
 *               komoditas_id:
 *                 type: string
 *                 format: uuid
 *                 description: Commodity ID
 *               jumlah_benih:
 *                 type: number
 *                 description: Seed quantity
 *               satuan:
 *                 type: string
 *                 description: Unit
 *               varietas:
 *                 type: string
 *                 description: Variety
 *               tipe:
 *                 type: string
 *                 enum: [siaptanam, pratanam]
 *                 description: Certification type
 *               file_asal_benih:
 *                 type: string
 *                 format: binary
 *                 description: Seed origin file
 *               file_dokumen_pendukung:
 *                 type: string
 *                 format: binary
 *                 description: Supporting document file
 *     responses:
 *       201:
 *         description: Certification created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Certification'
 */
router.post('/', authenticateToken, (req, res) => certificationController.createCertification(req, res));

/**
 * @swagger
 * /api/certifications/{id}:
 *   get:
 *     summary: Get certification by ID
 *     description: Get detailed information of a specific certification
 *     tags: [Certifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Certification ID
 *     responses:
 *       200:
 *         description: Certification details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Certification'
 */
router.get('/:id', authenticateToken, (req, res) => certificationController.getCertificationById(req, res));

/**
 * @swagger
 * /api/certifications/{id}/inspections:
 *   get:
 *     summary: Get inspection details
 *     description: Get detailed inspection results for a certification
 *     tags: [Certifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Certification ID
 *     responses:
 *       200:
 *         description: Inspection details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       jumlah_benih:
 *                         type: number
 *                       jumlah_diperiksa:
 *                         type: number
 *                       jumlah_lolos:
 *                         type: number
 *                       jumlah_tidak_lolos:
 *                         type: number
 *                       jumlah_belum_lolos:
 *                         type: number
 *                       persentase_kemurnian:
 *                         type: number
 *                       kadar_air:
 *                         type: number
 *                       daya_berkecambah:
 *                         type: number
 *                       catatan:
 *                         type: string
 *                       status_pemeriksaan:
 *                         type: string
 *                         enum: [lolos, tidak_lolos, pending]
 *                       pemeriksa:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Certification not found
 */
router.get('/:id/inspections', authenticateToken, (req, res) => certificationController.getInspectionDetails(req, res));

/**
 * @swagger
 * /api/certifications/{id}/verification:
 *   post:
 *     summary: Verify certification
 *     description: Verify certification documents (only by verifikator)
 *     tags: [Certifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Certification ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approve, reject]
 *                 description: Verification decision
 *               catatan_administrasi:
 *                 type: string
 *                 description: Administrative notes (optional)
 *     responses:
 *       200:
 *         description: Certification verified successfully
 */
router.post('/:id/verification', authenticateToken, (req, res) => certificationController.verifyCertification(req, res));

/**
 * @swagger
 * /api/certifications/{id}/scheduling:
 *   post:
 *     summary: Schedule certification inspection
 *     description: Schedule field inspection (only by inspektur_kepala)
 *     tags: [Certifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Certification ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tanggal_jadwal_pemeriksaan
 *               - pemeriksa
 *             properties:
 *               tanggal_jadwal_pemeriksaan:
 *                 type: string
 *                 format: date-time
 *                 description: Inspection schedule date
 *               pemeriksa:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Inspector user IDs
 *     responses:
 *       200:
 *         description: Certification scheduled successfully
 */
router.post('/:id/scheduling', authenticateToken, (req, res) => certificationController.scheduleCertification(req, res));

/**
 * @swagger
 * /api/certifications/{id}/inspection:
 *   post:
 *     summary: Submit inspection result
 *     description: Submit field inspection result with detailed analysis (only by inspektur)
 *     tags: [Certifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Certification ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *               - jumlah_benih
 *               - jumlah_diperiksa
 *               - jumlah_lolos
 *               - jumlah_tidak_lolos
 *               - jumlah_belum_lolos
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approve, reject]
 *                 description: Inspection decision
 *               catatan_pemeriksaan:
 *                 type: string
 *                 description: General inspection notes
 *               jumlah_benih:
 *                 type: number
 *                 description: Total amount of seeds inspected
 *               jumlah_diperiksa:
 *                 type: number
 *                 description: Amount actually examined
 *               jumlah_lolos:
 *                 type: number
 *                 description: Amount that passed inspection
 *               jumlah_tidak_lolos:
 *                 type: number
 *                 description: Amount that failed inspection
 *               jumlah_belum_lolos:
 *                 type: number
 *                 description: Amount not yet processed
 *               persentase_kemurnian:
 *                 type: number
 *                 description: Purity percentage (optional)
 *               kadar_air:
 *                 type: number
 *                 description: Moisture content percentage (optional)
 *               daya_berkecambah:
 *                 type: number
 *                 description: Germination rate percentage (optional)
 *               catatan:
 *                 type: string
 *                 description: Detailed inspection notes (optional)
 *               file_dokumen_hasil_pemeriksaan:
 *                 type: string
 *                 format: binary
 *                 description: Inspection result document (optional)
 *     responses:
 *       200:
 *         description: Inspection submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Certification'
 *       400:
 *         description: Bad request - missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not an inspector or not assigned
 *       404:
 *         description: Certification not found
 */
router.post('/:id/inspection', authenticateToken, (req, res) => certificationController.inspectCertification(req, res));

/**
 * @swagger
 * /api/certifications/{id}/validation:
 *   post:
 *     summary: Validate certification
 *     description: Validate inspection results (only by inspektur_kepala)
 *     tags: [Certifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Certification ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approve, reject]
 *                 description: Validation decision
 *               catatan_validasi:
 *                 type: string
 *                 description: Validation notes (optional)
 *     responses:
 *       200:
 *         description: Certification validated successfully
 */
router.post('/:id/validation', authenticateToken, (req, res) => certificationController.validateCertification(req, res));

/**
 * @swagger
 * /api/certifications/{id}/publish:
 *   post:
 *     summary: Publish certification
 *     description: Publish final certificate (only by kepala)
 *     tags: [Certifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Certification ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nomor_surat_sertifikat
 *               - tanggal_sertifikat
 *               - tanggal_expired_sertifikat
 *             properties:
 *               nomor_surat_sertifikat:
 *                 type: string
 *                 description: Certificate number
 *               tanggal_sertifikat:
 *                 type: string
 *                 format: date
 *                 description: Certificate date
 *               tanggal_expired_sertifikat:
 *                 type: string
 *                 format: date
 *                 description: Certificate expiry date
 *               file_surat_sertifikat:
 *                 type: string
 *                 format: binary
 *                 description: Certificate file
 *     responses:
 *       200:
 *         description: Certificate published successfully
 */
router.post('/:id/publish', authenticateToken, (req, res) => certificationController.publishCertification(req, res));

export default router;
