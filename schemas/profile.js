const profileSchema = {
	username: {
		isAlphanumeric: {
			ignore: '_'
		},
		optional: true, // Made optional
	},
	oldPassword: {
		optional: false, // Made optional
	},
	password: {
		isStrongPassword: {
			minLength: 8,
			minLowercase: 1,
			minUppercase: 1,
			minNumbers: 1,
			minSymbols: 1,
		},
		optional: true, // Made optional
	},
	phone: {
		isMobilePhone: true,
		optional: true, // Made optional
	},
	homestate: {
		optional: true, // Made optional
	},
	interests: {
		isArray: true,
		optional: true, // Made optional
	},
};

module.exports = { profileSchema };