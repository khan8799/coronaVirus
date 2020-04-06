import { AbstractControl } from '@angular/forms';

export class CustomValidators {
    /*
    |   Username Validator
    */
    static usernameValidator(control: AbstractControl): { [key: string]: any } | null {
        const email: string = control.value;

        if (/^\d+$/.test(email)) return CustomValidators.phoneValidator(control);
        else return CustomValidators.emailValidator(control);
    }


    /*
    |   Email Validator
    */
    static emailValidator(control: AbstractControl): { [key: string]: any } | null {
        const email: string = control.value;

        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
            return null;
        else
            return { invalid: true };
    }


    /*
    |   Phone Validator
    */
    static phoneValidator(control: AbstractControl): { [key: string]: any } | null {
        const phone: string = control.value;

        if (!phone)
            return { required: true };
        else if (/\D/.test(phone))
            return { digits: true };
        else if (!(/^\d{10}$/.test(phone)))
            return { length: true };
        else
            return null;

    }


    /*
    |   Start Space Validator
    */
    static spaceValidator(control: AbstractControl): {[key: string]: any} | null {
        const text: AbstractControl = control.value;

        if (text[0] === ' ')
            return { startSpace: true };
        else
            return null;
    }


    /*
    |   Match Two Form Controls Validator
    */
    static matchPassword(group: AbstractControl): {[key: string]: any} | null {
        const password          = group.get('newPassword');
        const confirmPassword   = group.get('confirmPassword');

        if ((password.value === confirmPassword.value) || confirmPassword.pristine)
            return null;
        else
            return { passwordMismatch: true };
    }


    /*
    |   Zero Amount Validator
    */
    static zeroValidator(control: AbstractControl): {[key: string]: any} | null {
        const amount: number = control.value;

        if (amount === 0)
            return { zeroAmount: true };
        else
            return null;
    }


    /*
    |   Zero Amount Validator
    */
    static previousDateNotAllowedValidator(control: AbstractControl): {[key: string]: any} | null  {
        const date: Date = new Date(control.value);
        const todaysDate: Date = new Date();

        if (date) {
            const diff: number = (todaysDate.getTime() - date.getTime()) / 1000;
            const secondsInADay = 24 * 60 * 60;
            // tslint:disable-next-line: radix
            const numberOfDays = parseInt((diff / secondsInADay).toFixed());

            if (numberOfDays > 0)
                return { previousDateNotAllowed: true };
            else
                return null;
        }
    }
}
