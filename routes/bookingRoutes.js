import express from express;
import {
    createBooking,
    getAllBookings,
    getCustomerBookings,
    assignRider,
    updateBookingStatus,
    logRiderLocation,
    softDeleteBooking
} from '../controllers/bookingController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorizeRole } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.post('/', authenticate, authorizeRole('CUSTOMER'), createBooking);
router.get('/', authenticate, authorizeRole(ADMIN), getAllBookings);
router.get('/customer/:customerId', getCustomerBookings);
router.put('/:bookingId/assign-rider', assignRider);
router.put('/:bookingId/update-status', updateBookingStatus);
router.post('/:bookingId/location', logRiderLocation);
router.delete('/:bookingId', verifyToken, authorizeRole('ADMIN'), softDeleteBooking);

export default router;