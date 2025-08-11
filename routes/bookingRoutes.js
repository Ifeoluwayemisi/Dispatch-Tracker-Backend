import express from 'express';
import {
    createBooking,
    getAllBookings,
    getAssignedBookings,
    getBookingById,
    getCustomerBookings,
    assignRider,
    updateBookingStatus,
    logRiderLocation,
    softDeleteBooking,
    verifyDeliveryCode
} from '../controllers/bookingController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, restrictTo('CUSTOMER'), createBooking);
router.post('/verify-code', protect, restrictTo('CUSTOMER', 'ADMIN', 'RIDER'), verifyDeliveryCode);
router.post('/:bookingId/log-location', protect, restrictTo('RIDER'), logRiderLocation);
router.get('/assigned', protect, restrictTo('ADMIN', 'RIDER'), getAssignedBookings);
router.get('/customer', protect, restrictTo('CUSTOMER'), getCustomerBookings);
router.get('/', protect, restrictTo('ADMIN'), getAllBookings);
router.put('/:id/assign-rider', protect, restrictTo('ADMIN'), assignRider);
router.put('/:bookingId/update-status', protect, restrictTo('ADMIN', 'RIDER'), updateBookingStatus);
router.get('/:id', protect, restrictTo('ADMIN', 'CUSTOMER', 'RIDER'), getBookingById);
router.delete('/:bookingId', protect, restrictTo('ADMIN'), softDeleteBooking);

export default router;
