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
    verifyDeliveryCode,
    recoverBooking,
    hardDeleteBooking
} from '../controllers/bookingController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, restrictTo('CUSTOMER'), createBooking);
router.post('/verify-code', protect, restrictTo('CUSTOMER', 'ADMIN', 'RIDER'), verifyDeliveryCode);
router.post('/:bookingId/log-location', protect, restrictTo('RIDER'), logRiderLocation);
router.get('/assigned', protect, restrictTo('ADMIN', 'CUSTOMER', 'RIDER'), getAssignedBookings);
router.get('/customer', protect, restrictTo('CUSTOMER'), getCustomerBookings);
router.get('/', protect, restrictTo('ADMIN'), getAllBookings);
router.put('/:id/assign-rider', protect, restrictTo('ADMIN'), assignRider);
router.put('/:bookingId/update-status', protect, restrictTo('ADMIN'), updateBookingStatus);
router.get('/:id', protect, restrictTo('ADMIN', 'CUSTOMER', 'RIDER'), getBookingById);
router.patch('/:bookingId', protect, restrictTo('ADMIN'), softDeleteBooking);
router.patch('/:bookingId/recover', protect, restrictTo('ADMIN'), recoverBooking);
router.delete('/:bookingId/hard-delete', protect, restrictTo('ADMIN'), hardDeleteBooking);


export default router;
