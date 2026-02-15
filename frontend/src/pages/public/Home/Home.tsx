import HeroSection from './HeroSection';
import PlansSection from './PlansSection';
import PageContainer from '../../../components/layout/PageContainer';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col">
      <HeroSection />
      
      <PlansSection />

      {/* Additional sections can be added here */}
      <section className="py-20 bg-surface">
         <PageContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
               <div>
                  <img 
                    src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Daily Menu" 
                    className="rounded-card shadow-lg w-full h-auto object-cover"
                  />
               </div>
               <div>
                  <h2 className="text-3xl font-bold text-text-primary mb-6">Why Choose Us?</h2>
                  <div className="space-y-6">
                     <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">1</div>
                        <div>
                           <h3 className="font-semibold text-lg">Authentic Taste</h3>
                           <p className="text-text-secondary mt-1">Recipes passed down through generations, cooked with love.</p>
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">2</div>
                        <div>
                           <h3 className="font-semibold text-lg">Flexible Plans</h3>
                           <p className="text-text-secondary mt-1">Pause, resume, or cancel your subscription anytime with 1 click.</p>
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">3</div>
                        <div>
                           <h3 className="font-semibold text-lg">Live Tracking</h3>
                           <p className="text-text-secondary mt-1">Know exactly when your food is cooking and when it's out for delivery.</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </PageContainer>
      </section>
    </div>
  );
};

export default Home;
