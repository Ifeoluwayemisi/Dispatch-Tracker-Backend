import { generateBookingCode } from '../utils/generateCode.js';
import {PrismaClient} from '../generated/prisma/client.js';
const prisma = new PrismaClient();

//Create a new booking
export const createBooking = async(req, res) => {
    try {
    const{
    customerId,
    pickupAddress,
    deleveryAddress,
    code
    } = req.body;

const newBooking = await prisma.booking.create({
    data: {
        customerId,
        pickUpAddress,
        deliveryAddress,
        code,
    },
});

res.status(201).json({message: 'Booking created successfully', booking: newBooking});
} catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({error: 'Failed to create booking'});
 }
};

// Get all booking (admin)
export const getAllBookings = async(req,res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        const bookings = await prisma.booking.findMany({
            include: {
                customer: true,
                rider: true,
                locationLogs: true
            },
            skip: parseInt(skip),
            take: parseInt(limit),
            orderBy: {createdAt: 'desc'}
        });
        
        res.status(200).json(bookings);
    } catch (err) {
        console.error('Error fetching bookings:', err);
        res.status(500).json({error: 'Failed to fetch bookings'});
    }
};

// Get customer booking
export const getCustomerBookings = async(req, res) => {
    try {
        const { customerId } = req.params;

        const bookings = await prisma.booking.findMany({
            where: { customerId: parseInt(customerId) },
            include: {
                rider: true,
                locationLogs: true
            },
        });

        res.status(200).json(bookings);
    } catch (err) {
        console.error('Error fetching customer bookings:', err);
        res.status(500).json({error: 'Failed to fetch customer bookings'});
    }
};

//Assign Customer to booking
export const assignRider = async(req, res) => {
    try{
        const {bookingId} = req.params;
        const {riderId} = req.body;

        const updated = await prisma.booking.update({
            where: {
                id: parseInt(bookingId)
            },
            data: {
                riderId,
                status: 'ASSIGNED',
            },
        });


        res.status(200).json({message: 'Rider assigned successfully', booking: updated});
    } catch(err) {
        console.error('Error assigning rider:', err);
        res.status(500).json({error: 'Failed to assign rider to booking'});
    }
    };

//Update booking status
export const updateBookingStatus = async(req, res) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body; // e.g., 'PICKED_UP', 'DELIVERED', etc.

        const updatedBooking = await prisma.booking.update({
            where: {
                id: parseInt(bookingId)
            },
            data: {
                status,
            },
        });

        res.status(200).json({message: 'Booking status updated successfully', booking: updatedBooking});
    } catch (err) {
        console.error('Error updating booking status:', err);
        res.status(500).json({error: 'Failed to update booking status'});
    }
};

//log riders location
export const logRiderLocation = async(req, res) => {
    try {
        const { bookingId } = req.params;
        const { lat, lng } = req.body;

        const newLog = await prisma.locationLog.create({
            data: {
                bookingId: parseInt(bookingId),
                lat,
                lng,
            },
        });

        res.status(201).json({message: 'Location logged successfully', log: newLog});
    } catch (err) {
        console.error('Error logging rider location:', err);
        res.status(500).json({error: 'Failed to log rider location'});
    }
};

export const softDeleteBooking = async(req, res) => {
    try {
        const { bookingId } = req.params;
        await prisma.booking.update({
            where: {
                id: parseInt(bookingId)
            },
            data: {
                isDeleted: true,
            },
        });

        res.status(200).json({message: 'Booking deleted successfully'});
    } catch (err) {
        console.error('Error deleting booking:', err);
        res.status(500).json({error: 'Failed to delete booking'});
    }
}