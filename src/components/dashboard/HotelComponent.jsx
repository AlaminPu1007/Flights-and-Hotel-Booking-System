/**
 * Copyright 2024 Alamin.
 *
 * Only the structure has been completed. Due to time constraints and the absence of an API key,
 * the integration of the API remains incomplete. The procedure is the same as that of flight search.
 */

'use client';

import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Api from '@/api-config/instance';
import { getCurrentDate, convertValidDate } from '@/assets/helperFunction';
import { toast } from 'react-toastify';
import { hotelsSchema } from '@/lib/schema/hotelsSchema';

const timeOutValue = 250;

const HotelComponent = () => {
    // Local state initialization
    const [isPending, startTransition] = useTransition();
    const [hotelsCityData, setHotelsCityData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const [IATA, setIATA] = useState({ cityIata: '' });
    const [debouncedValue, setDebouncedValue] = useState(null);
    const [flightsData, setFlightsData] = useState([]);

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
        resolver: yupResolver(hotelsSchema),
    });

    // Method to fetch flight data based on search
    const getFlightData = async (text = '') => {
        try {
            setLoading(true);
            const res = await Api.get(`locations/query`, {
                params: {
                    term: text,
                    locale: 'en-US',
                },
            });

            startTransition(() => {
                setHotelsCityData(res.data?.locations || []);

                if (!res.data?.locations?.length && IATA.cityIata) {
                    setIATA((prv) => ({ ...prv, cityIata: '' }));
                }
            });
        } catch (error) {
            // Log error in development environment
            if (process.env.NODE_ENV === 'development') console.log(error);

            // Reset flight data to initial state
            hotelsCityData?.length && setHotelsCityData([]);
        } finally {
            setLoading(false);
        }
    };

    // Form submission handler
    const onSubmit = async (data, e) => {
        e.preventDefault();
        if (btnLoading) return null;
        searchMethodForFlights(data);
    };

    // get search result
    const searchMethodForFlights = async (data = {}) => {
        // Destructure form data
        const { city = '', arrivalCity = '', departureDate = '', returnDate = '', adults = 1, children = 0 } = data;

        // make body
        const body = {
            fly_from: IATA.departureIata || departure || '',
            fly_to: IATA.arrivalCityIata || arrivalCity || '',
            date_from: convertValidDate(departureDate),
            adults: adults,
            children: children,
            // limit: 15,
        };

        if (!IATA.cityIata || !city) {
            return setError(`city`, { type: 'custom', message: 'Please select any city' });
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
    const grabTheCity = (item = {}) => {
        // set IATA
        setHotelsCityData([]);
        setValue('city', item.name);

        setIATA((prv) => ({ ...prv, cityIata: item?.code || '' }));
    };

    // Handle input change for departure text-input
    const onChangeTextInputMethod = (e) => {
        const value = e.target.value;

        // Clear the previous timeout if it exists
        if (debouncedValue) {
            clearTimeout(debouncedValue);
        }

        // Set a new timeout for fetching flight data
        const timeoutId = setTimeout(() => {
            getFlightData(value);
        }, timeOutValue);

        // Store the timeout ID in state
        setDebouncedValue(timeoutId);
    };

    return (
        <div id='flight-widget-container' className='my-5'>
            <h2 className='title-txt'>Find the right hotel today.</h2>
            <div className='form-container'>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className='row gx-3'>
                        <div className='col-lg'>
                            <div className='form-group'>
                                <label htmlFor='checkInDate' className='form-label'>
                                    Check In Date<span className='required-sign'>*</span>
                                </label>
                                <input
                                    type='date'
                                    {...register('checkInDate')}
                                    className={`form-control ${errors?.checkInDate?.message ? 'border-danger' : null}`}
                                    id='checkInDate'
                                    min={getCurrentDate()}
                                />
                                <p className='error-txt m-0 p-0 mt-1'>{errors?.checkInDate?.message}</p>
                            </div>
                        </div>
                        <div className='col-lg'>
                            <div className='form-group'>
                                <label htmlFor='checkOutDate' className='form-label'>
                                    Check Out Date<span className='required-sign'>*</span>
                                </label>
                                <input
                                    type='date'
                                    {...register('checkOutDate')}
                                    className={`form-control ${errors?.checkOutDate?.message ? 'border-danger' : null}`}
                                    id='return-date'
                                    min={getCurrentDate()}
                                />
                                <p className='error-txt m-0 p-0 mt-1'>{errors?.checkOutDate?.message}</p>
                            </div>
                        </div>
                        <div className='col-lg'>
                            <div className='input-search-wrapper position-relative'>
                                <div className='form-group'>
                                    <label htmlFor='city' className='form-label'>
                                        City<span className='required-sign'>*</span>
                                    </label>
                                    <input
                                        type='text'
                                        placeholder='Enter city'
                                        {...register('city', {
                                            onChange: (e) => onChangeTextInputMethod(e),
                                        })}
                                        className={`form-control ${errors.city?.message ? 'border-danger' : null}`}
                                        id='city'
                                        value={watch('city') || ''}
                                    />
                                    <p className='error-txt m-0 p-0 mt-1'>{errors.city?.message}</p>
                                </div>
                                <div>
                                    {hotelsCityData?.length ? (
                                        <div id='search-result'>
                                            {loading || isPending ? (
                                                <p className='mb-0 font-oswald'>Loading...</p>
                                            ) : (
                                                <>
                                                    <div id='result-list'>
                                                        {hotelsCityData.map((item, i) => {
                                                            return (
                                                                <div
                                                                    style={{ transitionDelay: `${i / 10}s` }}
                                                                    key={item.id}
                                                                    className='search-result-link text-capitalize'
                                                                    onClick={() => grabTheCity(item)}
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
                                <label htmlFor='rooms' className='form-label'>
                                    Number of Rooms<span className='required-sign'>*</span>
                                </label>
                                <input
                                    type='number'
                                    {...register('rooms')}
                                    className={`form-control ${errors?.rooms?.message ? 'border-danger' : null}`}
                                    id='rooms'
                                    max={2}
                                    placeholder='Enter number of rooms'
                                />
                                <p className='error-txt m-0 p-0 mt-1'>{errors?.rooms?.message}</p>
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
                    {!btnLoading && flightsData?.length
                        ? flightsData.map((item, index) => {
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
                                              <strong>Price:</strong> {price} EUR
                                          </p>
                                      </div>
                                  </div>
                              );
                          })
                        : null}
                    {btnLoading
                        ? Array.from({ length: 6 }).map((item, index) => {
                              return (
                                  <div className='col-lg-4 col-md-6 mb-3' key={index * new Date()}>
                                      <section className='card-skeleton-widget'>
                                          {/* <div className='profile-img' />
                                              <div className='skeleton-placeholder' /> */}
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

export default HotelComponent;
