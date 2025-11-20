import React from 'react';
import Header from '../../Header';

const MainLayout = ({children}) => {
    return (
        <div className="page-container">
            <Header/>
            <div className="app-layout">
                {children}
            </div>
        </div>
    );
};

export default MainLayout;
