/**
 * Copyright 2024 Alamin.
 *
 * This component will explore all necessary functionality as well as UI regarding
 * flights management system
 */

'use client';

import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Api from '@/api-config/instance';
import { dashboardSchema } from '@/lib/schema/flightsSchema';
import { getCurrentDate, convertValidDate } from '@/assets/helperFunction';
import { toast } from 'react-toastify';

const timeOutValue = 250;

const FlightComponent = () => {
    // Local state initialization
    const [isPending, startTransition] = useTransition();
    const [flightsDeparture, setFlightsDeparture] = useState([]);
    const [flightsArrival, setFlightsArrival] = useState([]);
    const [loading, setLoading] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const [IATA, setIATA] = useState({ departureIata: '', arrivalCityIata: '' });
    const [debouncedValue, setDebouncedValue] = useState(null);
    const [flightsData, setFlightsData] = useState([]);
    const [isInitial, setIsInitial] = useState(true);

    // Form initialization using react-hook-form
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        setError,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(dashboardSchema),
    });

    // Method to fetch flight data based on search
    const getFlightData = async (text = '', type = 'departure') => {
        // if any text input is not present, prevent to called api request
        if (!text?.length) {
            // Reset flight data to initial state
            flightsDeparture?.length && setFlightsDeparture([]);
            flightsArrival?.length && setFlightsArrival([]);
            return null;
        }

        try {
            setLoading(true);
            const res = await Api.get(`locations/query`, {
                params: {
                    term: text,
                    locale: 'en-US',
                },
            });

            if (!res.data?.locations?.length) {
                toast.error('No result is found');
            }

            startTransition(() => {
                if (type === 'departure') {
                    setFlightsDeparture(res.data?.locations || []);

                    if (!res.data?.locations?.length && IATA.departureIata) {
                        setIATA((prv) => ({ ...prv, departureIata: '' }));
                    }
                } else {
                    setFlightsArrival(res.data?.locations || []);
                    if (!res.data?.locations?.length && IATA.arrivalCityIata) {
                        setIATA((prv) => ({ ...prv, arrivalCityIata: '' }));
                    }
                }
            });
        } catch (error) {
            // Log error in development environment
            if (process.env.NODE_ENV === 'development') console.log(error);

            if (error?.response?.data == '400: Bad Request') {
                toast.error('Bad Request');
            } else {
                toast.error(error?.response?.data?.error || 'Something went wrong. Please try again latter');
            }
            // Reset flight data to initial state
            flightsDeparture?.length && setFlightsDeparture([]);
            flightsArrival?.length && setFlightsArrival([]);
        } finally {
            setLoading(false);
        }
    };

    // Form submission handler
    const onSubmit = async (data, e) => {
        e.preventDefault();
        // if already requested for api, then prevent others
        if (btnLoading) return null;

        // get data according user-input
        searchMethodForFlights(data);
    };

    // get search result
    const searchMethodForFlights = async (data = {}) => {
        // Destructure form data
        const {
            departure = '',
            arrivalCity = '',
            departureDate = '',
            returnDate = '',
            adults = 1,
            children = 0,
        } = data;

        // make body
        const body = {
            fly_from: IATA.departureIata || departure || '',
            fly_to: IATA.arrivalCityIata || arrivalCity || '',
            date_from: convertValidDate(departureDate),
            adults: adults,
            children: children || 0,
            sort: 'date',
            // limit: 10,
        };

        if (!IATA.departureIata || !departure) {
            return setError(`departure`, { type: 'custom', message: 'Please select any departure location' });
        } else if (!arrivalCity || !IATA.arrivalCityIata) {
            return setError(`arrivalCity`, { type: 'custom', message: 'Please select any arrivalCity location' });
        }

        // Only include return dates if there is a return date specified
        if (returnDate) {
            body.return_from = convertValidDate(returnDate);
            body.return_to = convertValidDate(returnDate);
        }

        // start loader
        setBtnLoading(true);

        try {
            // Make API request for flight search
            const res = await Api.get(`/v2/search`, {
                params: body,
            });
            // Extract flight data from response
            const data = res.data?.data || [];
            setFlightsData(data);
            // set initial-state as a false
            setIsInitial(false);

            // reset the form
            reset();
        } catch (error) {
            // Display error toast message
            toast.error(error?.response?.data?.error || 'Something went wrong. Please try again latter');
            // Log error in development environment
            if (process.env.NODE_ENV === 'development') {
                console.log(error);
            }
        } finally {
            setBtnLoading(false);
        }
    };

    // Method to handle selection of a city
    const grabTheCity = (item = {}, property = 'departureIata') => {
        // set IATA
        if (property === 'departureIata') {
            setFlightsDeparture([]);
            setValue('departure', item.name);
        } else {
            setFlightsArrival([]);
            setValue('arrivalCity', item.name);
        }
        setIATA((prv) => ({ ...prv, [property]: item?.code || '' }));
    };

    // get departure method of text-input
    const onChangeDepartureMethod = (e) => {
        const value = e.target.value;

        // Clear the previous timeout if it exists
        if (debouncedValue) {
            clearTimeout(debouncedValue);
        }

        // Set a new timeout
        const timeoutId = setTimeout(() => {
            getFlightData(value, 'departure');
        }, timeOutValue);

        // Store the timeout ID in state
        setDebouncedValue(timeoutId);
    };

    // Handle input change for departure text-input
    const onChangeArrivalMethod = (e) => {
        const value = e.target.value;

        // Clear the previous timeout if it exists
        if (debouncedValue) {
            clearTimeout(debouncedValue);
        }

        // Set a new timeout for fetching flight data
        const timeoutId = setTimeout(() => {
            getFlightData(value, 'arrivalCity');
        }, timeOutValue);

        // Store the timeout ID in state
        setDebouncedValue(timeoutId);
    };

    return (
        <div id='flight-widget-container' className='my-5'>
            <h2 className='title-txt'>Millions of cheap flights. One simple search.</h2>
            <div className='form-container'>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className='row gx-3'>
                        <div className='col-lg'>
                            <div className='input-search-wrapper position-relative'>
                                <div className='form-group'>
                                    <label htmlFor='departure-city' className='form-label'>
                                        Departure City<span className='required-sign'>*</span>
                                    </label>
                                    <input
                                        type='text'
                                        placeholder='Enter departure city'
                                        {...register('departure', {
                                            onChange: (e) => onChangeDepartureMethod(e),
                                        })}
                                        className={`form-control ${errors.departure?.message ? 'border-danger' : null}`}
                                        value={watch('departure') || ''}
                                        id='departure-city'
                                    />
                                    <p className='error-txt m-0 p-0 mt-1'>{errors.departure?.message}</p>
                                </div>
                                <div>
                                    {flightsDeparture?.length ? (
                                        <div id='search-result'>
                                            {loading || isPending ? (
                                                <p className='mb-0 font-oswald'>Loading...</p>
                                            ) : (
                                                <>
                                                    <div id='result-list'>
                                                        {flightsDeparture.map((item, i) => {
                                                            return (
                                                                <div
                                                                    style={{ transitionDelay: `${i / 10}s` }}
                                                                    key={item.id}
                                                                    className='search-result-link text-capitalize'
                                                                    onClick={() => grabTheCity(item, 'departureIata')}
                                                                >
                                                                    {item?.name || ''}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                        <div className='col-lg'>
                            <div className='input-search-wrapper position-relative'>
                                <div className='form-group'>
                                    <label htmlFor='arrivalCity' className='form-label'>
                                        Arrival City<span className='required-sign'>*</span>
                                    </label>
                                    <input
                                        type='text'
                                        placeholder='Enter arrival city'
                                        {...register('arrivalCity', {
                                            onChange: (e) => onChangeArrivalMethod(e),
                                        })}
                                        className={`form-control ${
                                            errors.arrivalCity?.message ? 'border-danger' : null
                                        }`}
                                        id='arrivalCity'
                                        value={watch('arrivalCity') || ''}
                                    />
                                    <p className='error-txt m-0 p-0 mt-1'>{errors.arrivalCity?.message}</p>
                                </div>
                                <div>
                                    {flightsArrival?.length ? (
                                        <div id='search-result'>
                                            {loading || isPending ? (
                                                <p className='mb-0 font-oswald'>Loading...</p>
                                            ) : (
                                                <>
                                                    <div id='result-list'>
                                                        {flightsArrival.map((item, i) => {
                                                            return (
                                                                <div
                                                                    style={{ transitionDelay: `${i / 10}s` }}
                                                                    key={item.id}
                                                                    className='search-result-link text-capitalize'
                                                                    onClick={() => grabTheCity(item, 'arrivalCityIata')}
                                                                >
                                                                    {item?.name || ''}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                        <div className='col-lg'>
                            <div className='form-group'>
                                <label htmlFor='departure-date' className='form-label'>
                                    Departure Date<span className='required-sign'>*</span>
                                </label>
                                <input
                                    type='date'
                                    {...register('departureDate')}
                                    className={`form-control ${
                                        errors?.departureDate?.message ? 'border-danger' : null
                                    }`}
                                    id='departure-date'
                                    min={getCurrentDate()}
                                />
                                <p className='error-txt m-0 p-0 mt-1'>{errors?.departureDate?.message}</p>
                            </div>
                        </div>
                        <div className='col-lg'>
                            <div className='form-group'>
                                <label htmlFor='return-date' className='form-label'>
                                    Return Date
                                </label>
                                <input
                                    type='date'
                                    {...register('returnDate')}
                                    className={`form-control ${errors?.returnDate?.message ? 'border-danger' : null}`}
                                    id='return-date'
                                    min={getCurrentDate()}
                                />
                                <p className='error-txt m-0 p-0 mt-1'>{errors?.returnDate?.message}</p>
                            </div>
                        </div>

                        <div className='col-lg'>
                            <div className='form-group'>
                                <label htmlFor='adults' className='form-label'>
                                    Number of Adults<span className='required-sign'>*</span>
                                </label>
                                <input
                                    type='number'
                                    {...register('adults')}
                                    className={`form-control ${errors?.adults?.message ? 'border-danger' : null}`}
                                    id='adults'
                                    placeholder='Enter number of adults'
                                    required
                                    max={2}
                                />
                                <p className='error-txt m-0 p-0 mt-1'>{errors?.adults?.message}</p>
                            </div>
                        </div>

                        <div className='col-lg'>
                            <div className='form-group'>
                                <label htmlFor='children' className='form-label'>
                                    Number of Children
                                </label>
                                <input
                                    type='number'
                                    {...register('children')}
                                    className={`form-control ${errors?.children?.message ? 'border-danger' : null}`}
                                    id='children'
                                    max={2}
                                    placeholder='Enter number of children'
                                />
                                <p className='error-txt m-0 p-0 mt-1'>{errors?.children?.message}</p>
                            </div>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-lg-2 mt-lg-4'>
                            <button type='submit' className='btn btn-widget'>
                                {btnLoading ? (
                                    <div className='spinner-border' role='status'>
                                        <span className='visually-hidden'>Loading...</span>
                                    </div>
                                ) : (
                                    'Submit'
                                )}
                                {!btnLoading ? (
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        width='16'
                                        height='16'
                                        fill='currentColor'
                                        className='bi bi-arrow-right'
                                        viewBox='0 0 16 16'
                                    >
                                        <path
                                            fillRule='evenodd'
                                            d='M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8'
                                        />
                                    </svg>
                                ) : null}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            <div className='card-widget mt-3'>
                <div className='row gx-3'>
                    {!btnLoading && flightsData?.length ? (
                        flightsData.map((item, index) => {
                            const {
                                cityFrom = '',
                                flyFrom = '',
                                cityTo = '',
                                flyTo = '',
                                local_arrival = '',
                                airlines = '',
                                price = '',
                                local_departure = '',
                            } = item;
                            return (
                                <div className='col-lg-4 col-md-6 mb-3' key={item.id}>
                                    <div className='flight-card h-100'>
                                        <h3 className='title-txt-styles'>{`Flight from ${cityFrom}, ${flyFrom} to ${cityTo}, ${flyTo}`}</h3>
                                        <p className='input-date-txt'>
                                            <strong>Departure:</strong> {new Date(local_departure).toLocaleString()}
                                        </p>
                                        <p className='input-date-txt'>
                                            <strong>Arrival:</strong> {new Date(local_arrival).toLocaleString()}
                                        </p>
                                        <p className='airlines-txt'>
                                            <strong>Airlines:</strong> {airlines.join(', ')}
                                        </p>
                                        <p className='price-txt'>
                                            {/* currency would be dynamic in real life scenario */}
                                            <strong>Price:</strong> {parseInt(price * 119.28)} BDT
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    ) : !isInitial && !btnLoading ? (
                        <div className='d-flex justify-content-center align-items-center fs-3'>No result is found.</div>
                    ) : null}

                    {btnLoading
                        ? Array.from({ length: 6 }).map((item, index) => {
                              return (
                                  <div className='col-lg-4 m-0 col-md-6 mb-3' key={index * new Date()}>
                                      <section className='card-skeleton-widget'>
                                          <div className='skeleton-placeholder' />
                                      </section>
                                  </div>
                              );
                          })
                        : null}
                </div>
            </div>
        </div>
    );
};

export default FlightComponent;
