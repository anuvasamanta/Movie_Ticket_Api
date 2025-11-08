const UserModel = require('../model/userModel')
const { userValidation } = require('../helper/validation')
const ComparePassword = require('../helper/ComparePassword')
const OtpEmailVerify = require('../helper/OtpEmailVerify');
const StatusCode = require('../helper/statusCode')
const { HashedPassword, RandomPassword } = require('../helper/HashedPassword')
const OtpModel = require('../model/otpModel')
const jwt = require('jsonwebtoken')
class UserController {
    // register Users
    async register(req, res) {
        try {
            // Validate user input
            const { error } = await userValidation().validateAsync(req.body);
            if (error) {
                req.flash('error', error.message);
                return res.status(StatusCode.BAD_REQUEST).json({ message: error.message });
            }

            // Check if user already exists
            const existingUser = await UserModel.findOne({ email: req.body.email });
            if (existingUser) {
                req.flash('error', "Email already exists");
                return res.status(StatusCode.CONFLICT).json({ message: 'Email already exists' });
            }

            // Check if file is uploaded
            if (!req.file) {
                req.flash('error', "Please upload a profile image");
                return res.status(StatusCode.BAD_REQUEST).json({ message: 'Please upload a profile image' });
            }

            // Hash password and create new user
            const hashedPassword = await HashedPassword(req.body.password);
            const user = new UserModel({ ...req.body, password: hashedPassword, profile: req.file.path });
            const savedUser = await user.save();
            OtpEmailVerify(req, savedUser);

            return res.json({ success: true, message: 'User registered successfully. OPT is send to user mail_ID!', users: savedUser });
        } catch (error) {
            console.error(error);
            req.flash('error', 'Internal server error');
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
        }
    }


    // verify Users
    async verify(req, res) {
        try {
            const { email, otp } = req.body;
            // Check if all required fields are provided
            if (!email || !otp) {
                req.flash('error', 'All fields are required');
                return res.status(400).json({ status: false, message: "All fields are required" });
            }
            const existingUser = await UserModel.findOne({ email });

            // Check if email doesn't exists
            if (!existingUser) {
                req.flash('error', 'Email does not exists');
                return res.status(404).json({ status: "failed", message: "Email doesn't exists" });
            }

            // Check if email is already verified
            if (existingUser.is_verified) {
                req.flash('success', 'User verified successfully!');
                return res.json({ success: true, message: 'User verified successfully!' });
            }
            // Check if there is a matching email verification OTP
            const emailVerification = await OtpModel.findOne({ userId: existingUser._id, otp });
            if (!emailVerification) {
                if (!existingUser.is_verified) {
                    // console.log(existingUser);
                    await OtpEmailVerify(req, existingUser);

                }
                return res.status(400).json({ status: false, message: "Invalid OTP" });
            }
            // Check if OTP is expired
            const currentTime = new Date();
            // 1 * 60 * 1000 calculates the expiration period in milliseconds(15 minutes).
            const expirationTime = new Date(emailVerification.createdAt.getTime() + 1 * 60 * 1000);
            if (currentTime > expirationTime) {
                // OTP expired, send new OTP
                await OtpEmailVerify(req, existingUser);
                req.flash('error', 'OTP expired, new OTP sent to your email');
                // return res.status(400).json({ status: "failed", message: "OTP expired, new OTP sent to your email" });
            }
            const timeLeft = Math.floor((expirationTime - currentTime) / 1000); // in seconds
            console.log(timeLeft);

            // OTP is valid and not expired, mark email as verified
            existingUser.is_verified = true;
            await existingUser.save();

            // Delete email verification document
            await OtpModel.deleteMany({ userId: existingUser._id });
            res.status(StatusCode.CREATED).json({ message: "OPT is successfully verify!" })


        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: "Unable to verify email, please try again later" });
        }

    }

    // login Users
    async createLogin(req, res) {
        try {
            const { password, email } = req.body;
            if (!email || !password) {
                req.flash('error', 'Email and password are required')
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }

            const user = await UserModel.findOne({ email });
            if (!user || !(await ComparePassword(password, user.password))) {
                req.flash('error', 'Invalid email or password')
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            let jwtSecret;
            let cookieName;
            if (user.role === 'Admin') {
                jwtSecret = process.env.JWT_SECRET_ADMIN || "hellowelcomeAdmin123456";
                cookieName = 'adminToken';
            } else if (user.role === 'User') {
                jwtSecret = process.env.JWT_SECRET || "hellowelcometowebskittersacademy123456";
                cookieName = 'userToken';
            } else {
                req.flash('error', 'User role not found')
                return res.status(404).json({
                    success: false,
                    message: 'User role not found'
                });
            }

            if (!jwtSecret) {
                req.flash('error', 'JWT secret not found')
                return res.status(500).json({
                    success: false,
                    message: 'JWT secret not found'
                });
            }

            const token = jwt.sign({
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                area: user.area,
                profile: user.profile
            }, jwtSecret, { expiresIn: '60m' });

            // Set cookie
            res.cookie(cookieName, token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });
            // Return JSON response instead of redirecting
            return res.status(200).json({
                success: true,
                message: 'Login successful',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    area: user.area,
                    profile: user.profile
                },
                role: user.role,
                token: token
            });

        } catch (error) {
            req.flash('error', 'Internal server error')
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // get user profile
    async getProfile(req, res) {
        try {
            const userId = req.user.id;
            const user = await UserModel.findById(userId).select('-password');
            if (!user) {
                req.flash('error', 'User not found');
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: 'User not found'
                });
            }

            return res.status(StatusCode.CREATED).json({
                success: true,
                message: 'User profile retrieved successfully',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    area: user.area,
                    profile: user.profile,
                    is_verified: user.is_verified,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            });
        } catch (error) {
            console.error('Get profile error:', error);
            req.flash('error', 'Internal server error');
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    // update profile
    async updateProfile(req, res) {
        try {
            // console.log( req.body);
            // console.log('Uploaded File:', req.file);
            const userId = req.user.id;
            const { email, password, name, phone, area } = req.body;

            // Find user
            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const updateData = {};

            if (email && email !== user.email) {
                const emailExists = await UserModel.findOne({
                    email,
                    _id: { $ne: userId }
                });
                if (emailExists) {
                    return res.status(409).json({
                        success: false,
                        message: 'Email already exists'
                    });
                }
                updateData.email = email;
                updateData.is_verified = false;
            }

            if (name) updateData.name = name;
            if (phone) updateData.phone = phone;
            if (area) updateData.area = area;

            if (password) {
                updateData.password = await HashedPassword(password);
            }

            // Update profile image 
            if (req.file) {
                updateData.profile = req.file.path;
            }

            // Update user
            const updatedUser = await UserModel.findByIdAndUpdate(
                userId,
                { $set: updateData },
                { new: true, runValidators: true }
            ).select('-password');

            // Send OTP if email changed
            if (updateData.email && !updatedUser.is_verified) {
                await OtpEmailVerify(req, updatedUser);
            }

            return res.status(200).json({
                success: true,
                message: updatedUser.is_verified
                    ? 'Profile updated successfully'
                    : 'Profile updated. Please verify your new email.',
                user: updatedUser
            });
        } catch (error) {
            console.error('Update profile error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // user logout
    async logoutUser(req, res) {
        try {
            res.clearCookie('userToken')
            return res.status(StatusCode.CREATED).json({
                message: "User Logout Successfully!"
            })
        } catch (error) {
            console.log(error);
        }
    }





}
module.exports = new UserController