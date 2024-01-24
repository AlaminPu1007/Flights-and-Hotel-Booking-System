import * as yup from 'yup';

export const hotelsSchema = yup.object().shape(
    {
        city: yup
            .string()
            .required('This is a required field')
            .min(1, 'This field is too short')
            .max(30, 'This field is too long'),

        checkInDate: yup.string().required('This is a required field'),

        checkOutDate: yup.string().required('This is a required field'),

        rooms: yup.string().required('This is a required field'),

        adults: yup.string().required('This is a required field'),

        children: yup.string().notRequired(),
    },
    //cyclic dependency
    [
        ['children', 'children'],
        ['adults', 'adults'],
    ]
);
