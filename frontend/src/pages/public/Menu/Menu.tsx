import React from 'react';
import PageContainer from '../../../components/layout/PageContainer';
import MonthlyMenu from './MonthlyMenu';

const Menu: React.FC = () => {

  return (
    <div className="bg-gray-50 min-h-screen">
       {/* Header */}
       <div className="bg-white border-b border-gray-200">
          <PageContainer className="py-12 text-center">
             <h1 className="text-4xl font-bold text-text-primary mb-4">Our Menu</h1>
             <p className="text-text-secondary max-w-2xl mx-auto">
               Explore our diverse selection of authentic home-cooked meals. 
               Each dish is prepared with fresh ingredients and traditional spices.
             </p>
          </PageContainer>
       </div>

       <PageContainer>
          {/* Content */}
          <div className="animate-fade-in">
             <MonthlyMenu />
          </div>
       </PageContainer>
    </div>
  );
};

export default Menu;
