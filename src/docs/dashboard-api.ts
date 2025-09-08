/**
 * Dashboard API Documentation
 * 
 * Endpoint: GET /api/dashboard/statistics
 * 
 * Response for Petani/Perusahaan:
 * {
 *   "success": true,
 *   "message": "Dashboard statistics retrieved successfully",
 *   "data": {
 *     "rekomendasi": 15,
 *     "sertifikasi": {
 *       "siap_tanam": {
 *         "proses": 5,
 *         "tolak": 2,
 *         "selesai": 8
 *       },
 *       "pra_tanam": {
 *         "proses": 3,
 *         "tolak": 1,
 *         "selesai": 6
 *       }
 *     }
 *   },
 *   "meta": {
 *     "userRole": "petani",
 *     "dashboardType": "petani_perusahaan"
 *   }
 * }
 * 
 * Response for Admin/Other roles:
 * {
 *   "success": true,
 *   "message": "Dashboard statistics retrieved successfully",
 *   "data": {
 *     "petani": 150,
 *     "perusahaan": 45,
 *     "rekomendasi": {
 *       "proses": 20,
 *       "tolak": 5,
 *       "selesai": 180
 *     },
 *     "sertifikasi": {
 *       "siap_tanam": {
 *         "proses": 25,
 *         "tolak": 8,
 *         "selesai": 120
 *       },
 *       "pra_tanam": {
 *         "proses": 15,
 *         "tolak": 3,
 *         "selesai": 85
 *       }
 *     }
 *   },
 *   "meta": {
 *     "userRole": "admin",
 *     "dashboardType": "admin_overview"
 *   }
 * }
 * 
 * Status Mapping:
 * Recommendations:
 * - Status 1-4: proses
 * - Status 5: selesai  
 * - Status 6: tolak
 * 
 * Certifications:
 * - Status 1-5: proses
 * - Status 6: selesai
 * - Status 7: tolak
 */

export const DashboardDocumentation = 'See comments above for API documentation';
