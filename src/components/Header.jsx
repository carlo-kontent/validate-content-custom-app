import { useEffect, useState } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import { getCustomAppContext } from '@kontent-ai/custom-app-sdk';

const Header = () => {
  const [environmentId, setEnvironmentId] = useState('');
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRoles, setUserRoles] = useState([]);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const fetchContext = async () => {
      const response = await getCustomAppContext();

      if (response.isError) {
        console.error({
          errorCode: response.code,
          description: response.description,
        });
      } else {
        console.log({
          config: response.config,
          context: response.context,
        });

        setEnvironmentId(response.context.environmentId || '');
        setUserId(response.context.userId || '');
        setUserEmail(response.context.userEmail || '');
        setUserRoles(response.context.userRoles || []);
        setConfig(response.config || null);
      }
    };

    fetchContext();
  }, []);

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
        <hr />
        <div className='mt-2 text-sm text-gray-600 space-y-1 '>
          <div>
            <strong>Environment ID:</strong> {environmentId}
          </div>
          <div>
            <strong>User ID:</strong> {userId}
          </div>
          <div>
            <strong>User Email:</strong> {userEmail}
          </div>
          <div>
            <strong>User Roles:</strong>
            {Array.isArray(userRoles) &&
              userRoles.map((userRole, index) => (
                <div key={index} className='ml-2'>
                  <strong>Id:</strong> <span>{userRole.id}</span> <br />
                  <strong>Codename:</strong> <span>{userRole.codename}</span>
                </div>
              ))}
          </div>
          <div>
            <strong>Config:</strong>
            <pre className='bg-gray-100 p-2 rounded overflow-x-auto'>
              <code>{JSON.stringify(config, null, 2)}</code>
            </pre>
          </div>
          <br />
        </div>
      </div>
    </header>
  );
};

export default Header;
