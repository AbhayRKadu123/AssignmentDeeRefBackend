import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    try {
        // Token can come from headers
        const token = req.headers["authorization"]?.split(" ")[1]; 
        // Example: "Bearer jfhgjdfgjdfg"

        if (!token) {
            return res.status(401).json({ err: "No token provided" });
        }

        const decoded = jwt.verify(token, 'MYSECRETKEY');

        // Save user data to request so routes can use it
        req.user = decoded;

        next(); // go to next function

    } catch (err) {
        console.log(err);
        return res.status(401).json({ err: "Invalid or expired token" });
    }
};
