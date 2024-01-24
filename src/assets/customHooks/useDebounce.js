/**
 * Copyright 2024 Alamin.
 * 
 * To handle debounce effect of application
 */

import React, { useState, useEffect } from 'react';

export const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cleanup the previous timer on each value change
        return () => clearTimeout(timerId);
    }, [value, delay]);

    return debouncedValue;
};
