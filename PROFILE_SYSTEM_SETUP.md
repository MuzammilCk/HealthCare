# Profile Management System Setup Guide

## Overview
This guide covers the setup and installation of the comprehensive User Profile Management System that has been integrated into the HealthCare application.

## Features Implemented

### ✅ Backend Features
- **Profile API Endpoints**: Complete CRUD operations for user profiles
- **Profile Picture Upload**: Secure image upload with validation and processing
- **Password Management**: Secure password change functionality
- **Image Processing**: Automatic image resizing and optimization using Sharp
- **Security**: Rate limiting, input sanitization, and file validation
- **File Management**: Automatic cleanup of old profile pictures

### ✅ Frontend Features
- **Modern Profile Page**: Clean, responsive profile management interface
- **Profile Picture Management**: Upload, preview, and remove profile pictures
- **Real-time Updates**: Immediate UI updates after profile changes
- **Form Validation**: Client-side and server-side validation
- **Responsive Design**: Works seamlessly on all device sizes
- **Avatar Component**: Reusable avatar component with fallback initials
- **Navigation Integration**: Profile link added to user dropdown menu

## Installation Steps

### 1. Backend Dependencies
Navigate to the backend directory and install the new dependencies:

```bash
cd backend
npm install multer@^1.4.5-lts.1 sharp@^0.33.0 validator@^13.11.0
```

### 2. Create Upload Directory
Create the uploads directory structure:

```bash
mkdir -p uploads/profiles
```

### 3. Environment Variables
Ensure your `.env` file includes the necessary configuration:

```env
# Existing variables...
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d

# Optional: API URL for frontend (if different from default)
# VITE_API_URL=http://localhost:5000
```

### 4. Frontend Dependencies
The frontend uses existing dependencies, no additional installation required.

## API Endpoints

### Profile Management
- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update profile information
- `PUT /api/profile/change-password` - Change user password

### Profile Picture Management
- `POST /api/profile/upload-picture` - Upload profile picture
- `DELETE /api/profile/picture` - Remove profile picture

### Static File Serving
- `GET /uploads/profiles/:filename` - Serve profile pictures

## Security Features

### Rate Limiting
- Profile updates: 10 requests per 15 minutes
- Picture uploads: 5 requests per 15 minutes
- Password changes: 3 requests per 15 minutes

### File Upload Security
- **File Type Validation**: Only image files allowed
- **File Size Limit**: 5MB maximum
- **Image Processing**: Automatic resize to 300x300px
- **Format Conversion**: All images converted to JPEG
- **Secure Storage**: Files stored outside web root

### Input Validation
- **Server-side Validation**: Express-validator for all inputs
- **Sanitization**: XSS protection and input cleaning
- **Password Requirements**: Minimum 6 characters with complexity rules

## Usage Guide

### For Users
1. **Access Profile**: Click your avatar → "Profile"
2. **Update Information**: Click "Edit" → Modify fields → "Save Changes"
3. **Change Picture**: Click camera icon → Select image → Automatic upload
4. **Change Password**: Go to Security section → "Change Password"

### For Developers
1. **Avatar Component**: Use `<Avatar src={photoUrl} name={userName} size="md" />`
2. **Profile Updates**: Use `updateUser()` from AuthContext
3. **API Integration**: All endpoints follow REST conventions
4. **Error Handling**: Comprehensive error messages and validation

## File Structure

### Backend Files Added/Modified
```
backend/
├── controllers/profile.js          # Profile management logic
├── routes/profile.js              # Profile API routes
├── server.js                      # Added profile routes and static serving
├── package.json                   # Added new dependencies
└── uploads/profiles/              # Profile picture storage
```

### Frontend Files Added/Modified
```
frontend/src/
├── pages/Profile.jsx              # Main profile page
├── components/ui/Avatar.jsx       # Reusable avatar component
├── components/ui/index.js         # Export Avatar component
├── components/ProfileButton.jsx   # Updated with profile link
├── contexts/AuthContext.jsx      # Added updateUser function
└── main.jsx                       # Added profile route
```

## Testing Checklist

### ✅ Profile Information
- [ ] View current profile information
- [ ] Edit name, email, and district
- [ ] Save changes successfully
- [ ] Validation error handling
- [ ] Real-time UI updates

### ✅ Profile Picture
- [ ] Upload new profile picture
- [ ] Image validation (type, size)
- [ ] Automatic image processing
- [ ] Remove profile picture
- [ ] Avatar display across app
- [ ] Fallback to initials

### ✅ Password Management
- [ ] Change password with current password
- [ ] Password validation
- [ ] Error handling for wrong current password
- [ ] Success confirmation

### ✅ Navigation & UX
- [ ] Profile link in dropdown menu
- [ ] Responsive design on mobile
- [ ] Loading states
- [ ] Error messages
- [ ] Success notifications

## Troubleshooting

### Common Issues

1. **Image Upload Fails**
   - Check file size (max 5MB)
   - Ensure file is an image type
   - Verify uploads directory exists and is writable

2. **Profile Picture Not Displaying**
   - Check if VITE_API_URL is set correctly
   - Verify static file serving is working
   - Check browser console for 404 errors

3. **Validation Errors**
   - Ensure all required fields are filled
   - Check password complexity requirements
   - Verify email format is valid

4. **Permission Issues**
   - Ensure uploads directory has write permissions
   - Check file system permissions on server

## Security Considerations

1. **File Upload Security**
   - Only authenticated users can upload
   - File type and size validation
   - Automatic image processing prevents malicious files
   - Old files are automatically cleaned up

2. **Data Protection**
   - Profile updates require authentication
   - Rate limiting prevents abuse
   - Input sanitization prevents XSS
   - Password changes require current password

3. **Privacy**
   - Users can only access their own profile
   - Profile pictures are served with proper headers
   - No sensitive data exposed in API responses

## Performance Optimizations

1. **Image Processing**
   - Automatic resize to standard dimensions
   - JPEG compression for smaller file sizes
   - Progressive JPEG for faster loading

2. **Caching**
   - Static file serving with proper cache headers
   - Client-side caching of user data
   - Optimized image formats

3. **Database**
   - Efficient queries with proper indexing
   - Minimal data transfer in API responses
   - Optimized update operations

## Future Enhancements

Potential improvements for the profile system:

1. **Advanced Image Features**
   - Image cropping interface
   - Multiple image formats support
   - Image filters and effects

2. **Enhanced Security**
   - Two-factor authentication
   - Login history tracking
   - Account activity monitoring

3. **Social Features**
   - Public profile visibility settings
   - Profile sharing capabilities
   - Social media integration

4. **Advanced Validation**
   - Email verification for changes
   - Phone number verification
   - Identity verification integration

## Support

For issues or questions regarding the profile management system:

1. Check this documentation first
2. Review the API endpoint responses for error details
3. Check browser console for client-side errors
4. Verify server logs for backend issues
5. Ensure all dependencies are properly installed

The profile management system is now fully integrated and ready for production use with comprehensive security, validation, and user experience features.
