const registerSchema = {
	email: {
		isEmail: true,
		optional: false,
	},
	username: {
		isAlphanumeric: {
			ignore: '_'
		},
		optional: false,
	},
	password: {
		isStrongPassword: {
			minLength: 8,
			minLowercase: 1,
			minUppercase: 1,
			minNumbers: 1,
			minSymbols: 1,
		},
		optional: false,
	},
	name: {
		optional: false,
	},
	phone: {
		isMobilePhone: true,
		optional: false,
	},
	homestate: {
		optional: false,
	},
	interests: {
		isArray: true,
		optional: false,
	},
};

module.exports = { registerSchema };