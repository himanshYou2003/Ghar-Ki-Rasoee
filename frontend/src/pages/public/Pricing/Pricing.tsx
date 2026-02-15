import React from 'react';
import PageContainer from '../../../components/layout/PageContainer';
import PlansSection from '../Home/PlansSection';

const Pricing: React.FC = () => {
  return (
    <div className="flex flex-col">
       <div className="bg-primary/5 py-16 text-center">
         <PageContainer>
           <h1 className="text-4xl font-bold text-text-primary mb-4">Transparent Pricing</h1>
           <p className="text-text-secondary max-w-2xl mx-auto text-lg">
             No hidden charges. No delivery fees. Just pure, wholesome food at a predictable cost.
           </p>
         </PageContainer>
       </div>
       
       <PlansSection />
       
       <PageContainer className="pb-20">
          <div className="bg-white rounded-card p-8 border border-gray-100 text-center">
             <h2 className="text-2xl font-bold mb-4">Looking for a One-Time Meal?</h2>
             <p className="text-text-secondary mb-6">Want to try before you subscribe? Order a single tiffin today.</p>
             <button className="px-8 py-3 bg-secondary text-white rounded-lg font-medium hover:bg-blue-600 transition">
               Order One-Time Standard Meal ($13)
             </button>
          </div>
       </PageContainer>
    </div>
  );
};

export default Pricing;
