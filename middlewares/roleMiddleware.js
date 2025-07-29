export const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;

        if (!user || !allowedRoles.includes(user.role)) {
            return 
            res.status(403).json({ error: "Forbidden: You don't have access to this resource" });
        }
        next();
    };
};