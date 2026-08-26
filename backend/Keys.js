require("dotenv").config();

const { MONGO_URL, JWT_SECRET } = process.env;

if (!MONGO_URL || !JWT_SECRET) {
	throw new Error("MONGO_URL and JWT_SECRET must be configured in .env");
}

module.exports = {
	mongoUrl: MONGO_URL,
	Jwt_secret: JWT_SECRET
};


