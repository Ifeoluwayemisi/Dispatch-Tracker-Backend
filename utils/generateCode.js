export const generateBookingCode = () => {
    const prefix = 'BK';
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${randomPart}`;
}