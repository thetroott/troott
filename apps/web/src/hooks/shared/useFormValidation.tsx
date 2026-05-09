import { useState, useCallback } from 'react';
import { usePasswordUtils } from './useValidaton';

interface ValidationRules {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
}

export interface FormValidationState {
    errors: Record<string, string>;
    touched: Record<string, boolean>;
    isValid: boolean;
}

const useFormValidation = (initialValues: Record<string, any>) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const { validateName, validateEmail, validatePassword } =
        usePasswordUtils();

    const validateField = useCallback(
        (name: string, value: any, rules: ValidationRules) => {
            if (rules.required && (!value || value.toString().trim() === '')) {
                return `${name} is required`;
            }

            if (rules.minLength && value && value.length < rules.minLength) {
                return `${name} must be at least ${rules.minLength} characters`;
            }

            if (rules.maxLength && value && value.length > rules.maxLength) {
                return `${name} must be no more than ${rules.maxLength} characters`;
            }

            if (rules.pattern && value && !rules.pattern.test(value)) {
                return `${name} format is invalid`;
            }

            if (rules.custom) {
                return rules.custom(value);
            }

            return null;
        },
        [],
    );

    const setField = useCallback(
        (name: string, value: any) => {
            setValues((prev) => ({ ...prev, [name]: value }));

            // Clear error when user starts typing
            if (errors[name]) {
                setErrors((prev) => ({ ...prev, [name]: '' }));
            }
        },
        [errors],
    );

    const setFieldTouched = useCallback((name: string) => {
        setTouched((prev) => ({ ...prev, [name]: true }));
    }, []);

    const validateForm = useCallback(
        (validationRules: Record<string, ValidationRules>) => {
            const newErrors: Record<string, string> = {};

            Object.keys(validationRules).forEach((fieldName) => {
                const value = values[fieldName];
                const rules = validationRules[fieldName];
                const error = validateField(
                    fieldName,
                    value,
                    rules ?? ({} as ValidationRules),
                );

                if (error) {
                    newErrors[fieldName] = error;
                }
            });

            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        },
        [values, validateField],
    );

    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
    }, [initialValues]);

    // Enhanced validation methods
    const validateNameField = useCallback(
        (name: string, value: string, fieldName: string) => {
            const error = validateName(value, fieldName);
            if (error) {
                setErrors((prev) => ({ ...prev, [name]: error }));
            } else {
                setErrors((prev) => ({ ...prev, [name]: '' }));
            }
            return !error;
        },
        [validateName],
    );

    const validateEmailField = useCallback(
        (name: string, value: string) => {
            const error = validateEmail(value);
            if (error) {
                setErrors((prev) => ({ ...prev, [name]: error }));
            } else {
                setErrors((prev) => ({ ...prev, [name]: '' }));
            }
            return !error;
        },
        [validateEmail],
    );

    const validatePasswordField = useCallback(
        (name: string, value: string) => {
            const error = validatePassword(value);
            if (error) {
                setErrors((prev) => ({ ...prev, [name]: error }));
            } else {
                setErrors((prev) => ({ ...prev, [name]: '' }));
            }
            return !error;
        },
        [validatePassword],
    );

    return {
        values,
        errors,
        touched,
        isValid: Object.keys(errors).length === 0,
        setField,
        setFieldTouched,
        validateForm,
        validateNameField,
        validateEmailField,
        validatePasswordField,
        reset,
        setErrors,
        setTouched,
    };
};

export default useFormValidation;
