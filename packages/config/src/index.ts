import "dotenv/config";
const JWT_SECRET = process.env.JWT_SECRET || "Fallback_Secret";
export default JWT_SECRET;