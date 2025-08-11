import  { PrismaClient } from '@prisma/client';
import { generateBookingCode } from '../utils/generateCode.js';
import { verifyToken } from '../utils/jwt.js';

const prisma = new PrismaClient();

//Create a new booking for customer
export const createBooking = async(req, res) => {
    try {
    const{
    pickupAddress,
    deliveryAddress,
    } = req.body;
    const customerId = req.user.id;

    console.log('Generating code...')
    //generate 6 digit code
    const code = generateBookingCode(); 

    console.log('Creating booking in DB...')
    console.time('BookingCreate');
    // create booking in database
    const booking = await prisma.booking.create({
        data: {
            pickupAddress,
            deliveryAddress,
            code,
            customerId,
            status: 'PENDING'
        }
    });
    console.log('Booking created:', booking.id)
    console.timeEnd('BookingCreate');

    res.status(201).json({ message: 'Booking created', booking});
} catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({error: 'Failed to create booking'});
 }
};

// Get assigned booking (Rider)
export const getAssignedBookings = async(req,res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const riderId = Number(req.user.id);
        console.log('getAssignedBookings riderId:', riderId);

        const bookings = await prisma.booking.findMany({
            where: { riderId, isDeleted: false },
            include: {
                customer: true,
                locationLogs: true
            },
            skip: parseInt(skip),
            take: parseInt(limit),
            orderBy: {createdAt: 'desc'}
        });
        
        res.status(200).json(bookings);
    } catch (err) {
        console.error('Error fetching bookings:', err);
        res.status(500).json({error: 'Failed to fetch riders booking'});
    }
};

// rider to booking (Admin)
export const assignRider = async (req, res) => {
  try {
    const bookingId = Number(req.params.id);
    const riderId = Number( req.body.riderId);

    if (!bookingId || !riderId) {
        return res.status(400).json({ message: 'Booking and riderId not found' });
    }
    // confirm rider exist 
    const rider = await prisma.user.findUnique({ where: { id: riderId} });
    if(!rider || rider.role !== 'RIDER') {
        return res.status(400).json({ message: 'Invalid riderId' });
    }

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { riderId, status: 'ASSIGNED' },
    include: { customer: true, rider: true }
  });

  console.log('Booking after assign:', booking);
  return res.json({ message: 'Rider assigned', booking });

} catch (error) {
    console.error('Assign rider error:', error);
    res.status(500).json({ message: 'Error assigning rider to a booking' });
  }
};

// verifydeliverycode
export const verifyDeliveryCode = async (req, res) => {
  try { 
    const { bookingId, code } = req.body;
    const riderId = Number(req.user.id);

    if (!bookingId || !code) {
      return res.status(400).json({ message: 'Bookingid and code required'});
    }

    const booking = await prisma.booking.findUnique({ where: { id: Number(bookingId) } });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.riderId !== riderId) {
      return res.status(403).json({ message: "Invalid delivery code or booking not assigned to this rider" });
    }
    if (booking.status === 'DELIVERED') {
  return res.status(400).json({ message: 'This delivery code has already been used.' });
    }


    // Debug logs to reveal types and values before comparison
    console.log('Booking code (from DB):', booking.code, typeof booking.code);
    console.log('Code from request:', code, typeof code);

    // Make sure both are strings trimmed of whitespace for a fair comparison
    if (String(booking.code).trim() !== String(code).trim()) { 
      return res.status(400).json({ message: "Invalid delivery code" }); 
    }

    const updated = await prisma.booking.update({
      where: { id: Number(bookingId) },
      data: { status: 'DELIVERED' }
    });

    return res.json({ message: 'Booking marked as delivered', booking: updated });
  } catch (error) {
    console.error('Error verifying delivery code:', error);
    res.status(500).json({ message: 'Server error' });
  }   
};

// Get customer booking
export const getCustomerBookings = async(req, res) => {
    try {
        const { customerId } = req.user.id;

        const bookings = await prisma.booking.findMany({
            where: { customerId },
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

// get all bookings
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await prisma.booking.findMany({
            include: { customer: true, rider: true, locationLogs: true }
        });
        res.json(bookings);
    } catch (error) {
        console.error('Get all bookings error:', error );
        res.status(500).json({ message: 'Server error' });
    }
};

//get a single booking details
export const getBookingById = async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { customer: true, rider: true, locationLogs: true }
        });

        if(!booking) return 
        res.status(404).json({ message: 'Booking not found' });
        // check user role and ownership
        res.json(booking);
    } catch (error) {
        console.error('Get booking by ID error:', error);
        res.status(500).json({ message: 'Server error' });
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