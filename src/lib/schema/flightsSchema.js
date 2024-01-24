import * as yup from 'yup';

export const dashboardSchema = yup.object().shape(
    {
        departure: yup
            .string()
            .required('This is a required field')
            .min(1, 'This field is too short')
            .max(30, 'This field is too long'),

        arrivalCity: yup
            .string()
            .required('This is a required field')
            .min(1, 'This field is too short')
            .max(30, 'This field is too long'),

        departureDate: yup.string().required('This is a required field'),

        returnDate: yup.string().notRequired(),

        adults: yup.string().required('This is a required field'),

        children: yup.string().notRequired(),
    },
    //cyclic dependency
    [
        ['children', 'children'],
        ['adults', 'adults'],
    ]
);
