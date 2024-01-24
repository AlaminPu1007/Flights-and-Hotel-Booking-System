/**
 * Copyright 2024 Alamin.
 *
 * This component will explore all necessary functionality
 * for flight & hotel UI + Functionality
 */

'use client';

import React from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import FlightComponent from './FlightComponent';
import HotelComponent from './HotelComponent';

const Dashboard = () => {
    return (
        <div id='dashboard-widget' className='py-5'>
            <div className='container'>
                <Tabs defaultActiveKey='flight' id='uncontrolled-tab-example' className='mb-3'>
                    <Tab eventKey='flight' title='Flight'>
                        <FlightComponent />
                    </Tab>

                    <Tab eventKey='hotels' title='Hotels'>
                        <HotelComponent />
                    </Tab>
                </Tabs>
            </div>
        </div>
    );
};

export default Dashboard;
