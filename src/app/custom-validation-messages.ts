
export class CustomValidationMessages {
    private static _validationMessages = {
        name: {
            required: 'Full name is required',
            minlength: 'Full name must be greater than 4 characters',
            maxlength: 'Full name must be less than 20 characters',
            startSpace: 'Full name can not start with space'
        },
        userName: {
            required: 'Username is required',
            invalid: 'Email is invalid',
            startSpace: 'Email can not start with space',
            minlength: 'Phone number must be equal to 10 digits',
            digits: 'Only digits allowed',
            length: 'Phone number must be only 10 digits long'
        },
        email: {
            required: 'Email is required',
            invalid: 'Email is invalid',
            startSpace: 'Email can not start with space',
        },
        phone: {
            required: 'Phone number is required',
            minlength: 'Phone number must be equal to 10 digits',
            digits: 'Only digits allowed',
            length: 'Phone number must be only 10 digits long'
        },
        oldPassword: {
            required: 'Password is required',
            minlength: 'Password must be greater than or equal to 6 characters',
            maxlength: 'Password must be less than 20 characters',
            startSpace: 'Password can not start with space'
        },
        password: {
            required: 'Password is required',
            minlength: 'Password must be greater than or equal to 6 characters',
            maxlength: 'Password must be less than 20 characters',
            startSpace: 'Password can not start with space'
        },
        newPassword: {
            required: 'Password is required',
            minlength: 'Password must be greater than or equal to 6 characters',
            maxlength: 'Password must be less than 20 characters',
            startSpace: 'Password can not start with space'
        },
        passwordGroup: {
            passwordMismatch: 'New Password and Confirm Password do not match'
        },
        confirmPassword: {
            required: 'Confirm password is required',
        },
        otp: {
            required: 'OTP is required',
        },
        officialName: {
            required: 'Official Name is required',
            minlength: 'Official Name must be greater than 6 characters',
            maxlength: 'Official Name must be less than 20 characters',
            startSpace: 'Official Name can not start with space'
        },
        officialDesignation: {
            required: 'Official Designation is required',
            minlength: 'Official Designation must be greater than 6 characters',
            maxlength: 'Official Designation must be less than 20 characters',
            startSpace: 'Official Designation can not start with space'
        },
        officialPhone: {
            required: 'Phone number is required',
            minlength: 'Phone number must be equal to 10 digits',
            digits: 'Only digits allowed',
            length: 'Phone number must be only 10 digits long'
        },
        remarks: {
            required: 'Remarks is required',
        },
        quarantined: {
            required: 'Quarantined is required',
            minlength: 'Quarantined must be greater than 6 characters',
            maxlength: 'Quarantined must be less than 20 characters',
            startSpace: 'Quarantined can not start with space'
        },
    };

    static get validationMessages() {
        return this._validationMessages;
    }
}
