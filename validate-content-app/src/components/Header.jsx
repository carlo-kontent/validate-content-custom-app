import { Shield, AlertTriangle } from 'lucide-react';

const Header = () => {
  return (
    <header className='bg-white shadow-sm border-b border-gray-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='flex items-center'>
                <div className='p-2 bg-primary-100 rounded-lg mr-3'>
                  <Shield className='h-6 w-6 text-primary-600' />
                </div>
                <div>
                  <h1 className='text-xl font-bold text-gray-900'>
                    Validate Content App
                  </h1>
                  <p className='text-sm text-gray-500'>
                    Kontent.ai Content Validation Tool
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className='flex items-center space-x-4'>
            <div className='flex items-center text-sm text-gray-500'>
              <AlertTriangle className='h-4 w-4 mr-1' />
              <span>Content Quality Assurance</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
